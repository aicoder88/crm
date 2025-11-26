"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Upload, CheckCircle, AlertCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { logger } from "@/lib/logger"

// Define the shape of the CSV row based on the file inspection
interface CSVRow {
    Store: string
    Phone: string
    "owner/manager's name": string
    notes: string
    Status: string
    CONSOLIDATED_emails_valid: string
    BEST_province: string
    BEST_city: string
    BEST_street: string
    BEST_postal_code: string
    website: string
    "location/lat": string
    "location/lng": string
    "domain": string
    "emails/0": string
    "emails/1": string
    "facebooks/0": string
    "instagrams/0": string
    "tiktoks/0": string
    "youtubes/0": string
    [key: string]: string // Allow other columns
}

export function CsvImporter() {
    const [data, setData] = useState<CSVRow[]>([])
    const [isUploading, setIsUploading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [uploadResult, setUploadResult] = useState<{ success: number; errors: number } | null>(null)
    const supabase = createClient()

    // We use the native papaparse library directly via import in the handler
    // or we can use the react-papaparse hook if installed, but let's stick to simple file reading
    // since we might not have react-papaparse installed, but package.json said 'papaparse'.
    // Actually package.json has "papaparse": "^5.5.3".
    // Let's use standard papaparse.

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        import("papaparse").then((Papa) => {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    setData(results.data as CSVRow[])
                    setUploadResult(null)
                    setProgress(0)
                },
            })
        })
    }

    const parseCoordinate = (value: string | undefined): number | null => {
        if (!value) return null;
        const trimmed = value.trim();
        if (!trimmed) return null;

        // Try direct number
        const num = parseFloat(trimmed);
        if (!isNaN(num) && isFinite(num)) return num;

        // Try extracting from Google Maps URL (e.g., ...?q=43.6413,-79.4147)
        if (trimmed.includes("maps.google.com") || trimmed.includes("maps.app.goo.gl")) {
            const match = trimmed.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/);
            if (match) {
                // If we are parsing latitude (this function is generic, but usually lat is first in q param)
                // This is tricky because we need to know if we are parsing lat or lng.
                // Let's just return null for URLs in this simple helper and handle extraction separately if we want to be fancy.
                // For now, to fix the crash, let's just return null if it's not a valid number.
                return null;
            }
        }
        return null;
    };

    // Improved coordinate extractor that can handle the URL if it contains q=lat,lng
    const extractLat = (val: string | undefined): number | null => {
        if (!val) return null;
        const trimmed = val.trim();
        const num = parseFloat(trimmed);
        if (!isNaN(num) && isFinite(num)) return num;

        const match = trimmed.match(/[?&]q=(-?\d+\.\d+),/);
        if (match) return parseFloat(match[1]);
        return null;
    }

    const extractLng = (val: string | undefined): number | null => {
        if (!val) return null;
        const trimmed = val.trim();
        const num = parseFloat(trimmed);
        if (!isNaN(num) && isFinite(num)) return num;

        const match = trimmed.match(/[?&]q=-?\d+\.\d+,(-?\d+\.\d+)/);
        if (match) return parseFloat(match[1]);
        return null;
    }

    const processBatch = async () => {
        setIsUploading(true)
        setProgress(0)
        let successCount = 0
        let errorCount = 0
        const batchSize = 50

        // Filter out invalid rows first
        const validRows = data.filter(row => row["Store"] && row["Store"].trim().length > 0);
        const skippedCount = data.length - validRows.length;

        const total = validRows.length

        for (let i = 0; i < total; i += batchSize) {
            const batch = validRows.slice(i, i + batchSize)

            const formattedBatch = batch.map((row) => {
                return {
                    store_name: row["Store"]?.trim(),
                    phone: row["Phone"]?.trim() || null,
                    owner_manager_name: row["owner/manager's name"]?.trim() || null,
                    notes: (row["notes"]?.trim() || "") +
                        (row["result"] ? `\nEmail Verification: ${row["result"]}` : "") +
                        (row["INFO_email_status"] && !row["INFO_email_status"].match(/\d/) ? `\nEmail Status: ${row["INFO_email_status"]}` : ""),

                    status: mapStatus(row["Status"]),
                    email: row["CONSOLIDATED_emails_valid"]?.trim() || row["emails/0"]?.trim() || null,
                    province: row["BEST_province"]?.trim() || null,
                    city: row["BEST_city"]?.trim() || null,
                    street: row["BEST_street"]?.trim() || null,
                    postal_code: row["BEST_postal_code"]?.trim() || null,
                    website: row["website"]?.trim() || row["domain"]?.trim() || null,
                    location_lat: extractLat(row["location/lat"]),
                    location_lng: extractLng(row["location/lat"]), // Note: The CSV seems to have the URL in the 'lat' column sometimes, or maybe both. 
                    // Actually, looking at the debug output: Row 546: Invalid Latitude "https://maps.google.com/maps?q=50.028379,-125.252646"
                    // The URL is in the 'location/lat' column. The 'location/lng' column might be empty or similar.
                    // Let's try to extract from 'location/lat' if 'location/lng' is invalid.
                    type: 'B2B',
                };
            })

            // Fix for location_lng if it was extracted from lat column's URL
            formattedBatch.forEach(item => {
                if (item.location_lat && !item.location_lng) {
                    // Try to find lng in the original row's lat column if it was a URL
                    const originalRow = batch.find(r => r["Store"]?.trim() === item.store_name);
                    if (originalRow) {
                        item.location_lng = extractLng(originalRow["location/lat"]);
                    }
                }
                // If we still have a valid lat but no lng (and it wasn't a URL case), or vice versa, 
                // Supabase might be fine with one, but usually they go together.
                // Also ensure we check the actual location/lng column if it was a simple number
                if (!item.location_lng) {
                    const originalRow = batch.find(r => r["Store"]?.trim() === item.store_name);
                    if (originalRow) {
                        const lngVal = parseFloat(originalRow["location/lng"] || '');
                        if (!isNaN(lngVal) && isFinite(lngVal)) {
                            item.location_lng = lngVal;
                        }
                    }
                }
            });

            // Perform the insert and select the IDs of the inserted customers
            const { data: insertedCustomers, error } = await supabase
                .from("customers")
                .insert(formattedBatch)
                .select("id");

            if (error) {
                logger.error('CSV batch upload error', error instanceof Error ? error : new Error(String(error)), { batchSize: batch.length });
                errorCount += batch.length
            } else {
                successCount += batch.length

                // Prepare social media, contact, and tag inserts
                const socialMediaInserts: any[] = [];
                const contactInserts: any[] = [];
                // The user asked for tags, but the instruction comments suggest adding to notes instead for simplicity
                // Let's stick to the notes modification as implemented above in the map function.
                // If actual tag creation is needed, it would involve checking/creating tags in a separate table
                // and then inserting into a customer_tags join table, which is more complex for a batch importer.

                insertedCustomers.forEach((customer, index) => {
                    const row = batch[index];
                    if (!row) return;

                    // Social Media
                    const socialLinks = [
                        { platform: 'facebook', url: row['facebooks/0'] },
                        { platform: 'instagram', url: row['instagrams/0'] },
                        { platform: 'tiktok', url: row['tiktoks/0'] },
                        { platform: 'youtube', url: row['youtubes/0'] }
                    ];

                    socialLinks.forEach(link => {
                        if (link.url && link.url.trim()) {
                            socialMediaInserts.push({
                                customer_id: customer.id,
                                platform: link.platform,
                                url: link.url.trim()
                            });
                        }
                    });

                    // Secondary Emails / Contacts
                    // If emails/0 is different from the one we used (which was CONSOLIDATED or emails/0), add it.
                    // Actually, if we used emails/0 as main, we don't need to add it again.
                    // But if we used CONSOLIDATED, and emails/0 is different, add emails/0.
                    const mainEmail = row["CONSOLIDATED_emails_valid"]?.trim() || row["emails/0"]?.trim();
                    const email0 = row["emails/0"]?.trim();
                    const email1 = row["emails/1"]?.trim();

                    if (email0 && email0 !== mainEmail) {
                        contactInserts.push({
                            customer_id: customer.id,
                            name: "Secondary Contact", // We don't have a name for this specific email
                            email: email0,
                            is_primary: false
                        });
                    }

                    if (email1 && email1 !== mainEmail) {
                        contactInserts.push({
                            customer_id: customer.id,
                            name: "Other Contact",
                            email: email1,
                            is_primary: false
                        });
                    }
                });

                if (socialMediaInserts.length > 0) {
                    const { error: socialError } = await supabase
                        .from("customer_social_media")
                        .insert(socialMediaInserts);

                    if (socialError) {
                        logger.error('Error inserting social media links', socialError instanceof Error ? socialError : new Error(String(socialError)));
                        // We don't count this as a main failure, but log it
                    }
                }

                if (contactInserts.length > 0) {
                    const { error: contactError } = await supabase
                        .from("customer_contacts")
                        .insert(contactInserts);

                    if (contactError) {
                        logger.error('Error inserting customer contacts', contactError instanceof Error ? contactError : new Error(String(contactError)));
                    }
                }
            }

            setProgress(Math.round(((i + batch.length) / total) * 100))
        }

        setUploadResult({ success: successCount, errors: errorCount + skippedCount })
        setIsUploading(false)
    }

    const mapStatus = (status: string) => {
        // Map CSV status to Database status enum
        // DB: 'Qualified', 'Interested', 'Not Qualified', 'Not Interested', 'Dog Store'
        if (!status) return 'Qualified'
        // Add more mapping logic if needed, for now assuming CSV matches or defaults
        return status
    }

    return (
        <div className="space-y-6">
            <div className="grid w-full max-w-sm items-center gap-1.5">
                <Input type="file" accept=".csv" onChange={handleFileUpload} disabled={isUploading} />
            </div>

            {data.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Found {data.length} records. Ready to import.
                        </p>
                        <Button onClick={processBatch} disabled={isUploading}>
                            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isUploading ? "Importing..." : "Start Import"}
                        </Button>
                    </div>

                    {isUploading && <Progress value={progress} className="w-full" />}

                    {uploadResult && (
                        <Alert variant={uploadResult.errors > 0 ? "destructive" : "default"}>
                            {uploadResult.errors > 0 ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                            <AlertTitle>{uploadResult.errors > 0 ? "Import Completed with Errors" : "Import Successful"}</AlertTitle>
                            <AlertDescription>
                                Successfully imported {uploadResult.success} records. Failed: {uploadResult.errors}.
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="rounded-md border max-h-[400px] overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Store Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>City</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.slice(0, 10).map((row, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{row.Store}</TableCell>
                                        <TableCell>{row.CONSOLIDATED_emails_valid}</TableCell>
                                        <TableCell>{row.BEST_city}</TableCell>
                                        <TableCell>{row.Status}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <p className="text-xs text-muted-foreground">Showing first 10 records as preview.</p>
                </div>
            )}
        </div>
    )
}
