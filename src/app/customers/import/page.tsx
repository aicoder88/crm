import { CsvImporter } from "@/components/customers/csv-importer"
import { Separator } from "@/components/ui/separator"

export default function ImportPage() {
    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h3 className="text-lg font-medium">Import Customers</h3>
                <p className="text-sm text-muted-foreground">
                    Upload a CSV file to bulk import customer records.
                </p>
            </div>
            <Separator />
            <CsvImporter />
        </div>
    )
}
