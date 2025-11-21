"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Papa from "papaparse"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Upload, CheckCircle, AlertCircle, FileText } from "lucide-react"

export default function ImportPage() {
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<any[]>([])
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [result, setResult] = useState<{ success: number; errors: number } | null>(null)
    const router = useRouter()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            setFile(selectedFile)
            parseFile(selectedFile)
        }
    }

    const parseFile = (file: File) => {
        Papa.parse(file, {
            header: true,
            preview: 5, // Preview first 5 rows
            skipEmptyLines: true,
            complete: (results) => {
                setPreview(results.data)
            },
            error: (error) => {
                console.error("Error parsing CSV:", error)
            },
        })
    }

    const handleImport = async () => {
        if (!file) return

        setUploading(true)
        setProgress(0)
        setResult(null)

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const total = results.data.length
                let successCount = 0
                let errorCount = 0
                const batchSize = 50

                // Process in batches
                for (let i = 0; i < total; i += batchSize) {
                    const batch = results.data.slice(i, i + batchSize)

                    // Map CSV fields to database columns
                    // Based on actual CSV structure: name, phone, owner/manager's name, notes, status, email, province, city, address, postal code, website
                    const formattedBatch = batch.map((row: any) => ({
                        store_name: row['name'] || row['Store Name'] || row['store_name'] || 'Unknown Store',
                        email: row['email'] || row['Email'] || null,
                        phone: row['phone'] || row['Phone'] || null,
                        owner_manager_name: row["owner/manager's name"] || row['owner_manager_name'] || null,
                        status: mapStatus(row['status'] || row['Status']),
                        type: 'B2B', // Default to B2B for pet store imports
                        city: row['city'] || row['City'] || null,
                        province: row['province'] || row['Province'] || null,
                        street: row['address'] || row['Address'] || row['street'] || null,
                        postal_code: row['postal code'] || row['Postal Code'] || row['postal_code'] || null,
                        website: row['website'] || row['Website'] || null,
                        notes: row['notes'] || row['Notes'] || null,
                    }))

                    const { error } = await supabase
                        .from('customers')
                        .insert(formattedBatch)

                    if (error) {
                        console.error('Error inserting batch:', error)
                        errorCount += batch.length
                    } else {
                        successCount += batch.length
                    }

                    setProgress(Math.round(((i + batch.length) / total) * 100))
                }

                setResult({ success: successCount, errors: errorCount })
                setUploading(false)
            },
        })
    }

    const mapStatus = (status: string): string => {
        if (!status) return 'Qualified'
        const s = status.toLowerCase()
        if (s.includes('not interested')) return 'Not Interested'
        if (s.includes('interested')) return 'Interested'
        if (s.includes('not qualified')) return 'Not Qualified'
        if (s.includes('dog')) return 'Dog Store'
        return 'Qualified'
    }

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Import Customers</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Upload CSV</CardTitle>
                        <CardDescription>
                            Select a CSV file to import customer data.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="csv-file">CSV File</Label>
                            <Input id="csv-file" type="file" accept=".csv" onChange={handleFileChange} disabled={uploading} />
                        </div>

                        {file && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <FileText className="h-4 w-4" />
                                {file.name} ({(file.size / 1024).toFixed(2)} KB)
                            </div>
                        )}

                        {uploading && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Importing...</span>
                                    <span>{progress}%</span>
                                </div>
                                <Progress value={progress} />
                            </div>
                        )}

                        {result && (
                            <Alert variant={result.errors > 0 ? "destructive" : "default"} className={result.errors === 0 ? "border-green-500 text-green-500" : ""}>
                                {result.errors === 0 ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                                <AlertTitle>{result.errors === 0 ? "Success!" : "Completed with errors"}</AlertTitle>
                                <AlertDescription>
                                    Imported {result.success} records. {result.errors > 0 && `Failed to import ${result.errors} records.`}
                                </AlertDescription>
                            </Alert>
                        )}

                        <Button onClick={handleImport} disabled={!file || uploading} className="w-full">
                            {uploading ? "Importing..." : "Start Import"}
                        </Button>
                    </CardContent>
                </Card>

                {preview.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Preview</CardTitle>
                            <CardDescription>
                                First 5 rows from the selected file.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            {Object.keys(preview[0]).slice(0, 4).map((header) => (
                                                <TableHead key={header}>{header}</TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {preview.map((row, i) => (
                                            <TableRow key={i}>
                                                {Object.values(row).slice(0, 4).map((cell: any, j) => (
                                                    <TableCell key={j}>{cell}</TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
