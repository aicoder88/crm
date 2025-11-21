import { CustomerForm } from "@/components/customers/customer-form"
import { Separator } from "@/components/ui/separator"

export default function NewCustomerPage() {
    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div>
                <h3 className="text-lg font-medium">Add New Customer</h3>
                <p className="text-sm text-muted-foreground">
                    Create a new customer record in the CRM.
                </p>
            </div>
            <Separator />
            <CustomerForm />
        </div>
    )
}
