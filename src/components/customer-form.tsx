"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { TagSelector } from "./tag-selector"
import { Customer } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const formSchema = z.object({
    store_name: z.string().min(2, {
        message: "Store name must be at least 2 characters.",
    }),
    status: z.enum(["Qualified", "Interested", "Not Qualified", "Not Interested", "Dog Store"]),
    type: z.enum(["B2B", "B2C", "Affiliate"]),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),
    website: z.string().url().optional().or(z.literal("")),
    owner_manager_name: z.string().optional(),
    street: z.string().optional(),
    city: z.string().optional(),
    province: z.string().optional(),
    postal_code: z.string().optional(),
    notes: z.string().optional(),
    tags: z.array(z.string()),
    facebook: z.string().url().optional().or(z.literal("")),
    instagram: z.string().url().optional().or(z.literal("")),
    tiktok: z.string().url().optional().or(z.literal("")),
    youtube: z.string().url().optional().or(z.literal("")),
    contacts: z.array(z.object({
        name: z.string().min(1, "Name is required"),
        role: z.string().optional(),
        email: z.string().email().optional().or(z.literal("")),
        phone: z.string().optional(),
        is_primary: z.boolean().optional(),
    })).optional(),
})

type CustomerFormValues = z.infer<typeof formSchema>

interface CustomerFormProps {
    initialData?: Partial<Customer>
    customerId?: string
}

export function CustomerForm({ initialData, customerId }: CustomerFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    const defaultValues: CustomerFormValues = initialData ? {
        store_name: initialData.store_name || "",
        status: initialData.status || "Qualified",
        type: initialData.type || "B2B",
        phone: initialData.phone || "",
        email: initialData.email || "",
        website: initialData.website || "",
        owner_manager_name: initialData.owner_manager_name || "",
        street: initialData.street || "",
        city: initialData.city || "",
        province: initialData.province || "",
        postal_code: initialData.postal_code || "",
        notes: initialData.notes || "",
        tags: initialData.tags?.map(t => t.id) || [],
        facebook: initialData.social_media?.find(s => s.platform === 'facebook')?.url || "",
        instagram: initialData.social_media?.find(s => s.platform === 'instagram')?.url || "",
        tiktok: initialData.social_media?.find(s => s.platform === 'tiktok')?.url || "",
        youtube: initialData.social_media?.find(s => s.platform === 'youtube')?.url || "",
        contacts: initialData.contacts?.map(c => ({
            name: c.name,
            role: c.role || "",
            email: c.email || "",
            phone: c.phone || "",
            is_primary: c.is_primary,
        })) || [],
    } : {
        store_name: "",
        status: "Qualified",
        type: "B2B",
        phone: "",
        email: "",
        website: "",
        owner_manager_name: "",
        street: "",
        city: "",
        province: "",
        postal_code: "",
        notes: "",
        tags: [],
        facebook: "",
        instagram: "",
        tiktok: "",
        youtube: "",
        contacts: [],
    }

    const form = useForm<CustomerFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues,
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "contacts",
    })

    async function onSubmit(values: CustomerFormValues) {
        setLoading(true)
        try {
            const customerData = {
                store_name: values.store_name,
                status: values.status,
                type: values.type,
                phone: values.phone,
                email: values.email,
                website: values.website,
                owner_manager_name: values.owner_manager_name,
                street: values.street,
                city: values.city,
                province: values.province,
                postal_code: values.postal_code,
                notes: values.notes,
            }

            let targetCustomerId = customerId

            if (customerId) {
                const { error } = await supabase
                    .from("customers")
                    .update(customerData)
                    .eq("id", customerId)

                if (error) throw error
            } else {
                const { data, error } = await supabase
                    .from("customers")
                    .insert([customerData])
                    .select()
                    .single()

                if (error) throw error
                targetCustomerId = data.id
            }

            if (targetCustomerId) {
                // Handle Tags
                await supabase.from("customer_tags").delete().eq("customer_id", targetCustomerId)
                if (values.tags && values.tags.length > 0) {
                    const tagInserts = values.tags.map(tagId => ({
                        customer_id: targetCustomerId,
                        tag_id: tagId
                    }))
                    await supabase.from("customer_tags").insert(tagInserts)
                }

                // Handle Social Media
                await supabase.from("customer_social_media").delete().eq("customer_id", targetCustomerId)
                const socialInserts = []
                if (values.facebook) socialInserts.push({ customer_id: targetCustomerId, platform: 'facebook', url: values.facebook })
                if (values.instagram) socialInserts.push({ customer_id: targetCustomerId, platform: 'instagram', url: values.instagram })
                if (values.tiktok) socialInserts.push({ customer_id: targetCustomerId, platform: 'tiktok', url: values.tiktok })
                if (values.youtube) socialInserts.push({ customer_id: targetCustomerId, platform: 'youtube', url: values.youtube })
                if (socialInserts.length > 0) {
                    await supabase.from("customer_social_media").insert(socialInserts)
                }

                // Handle Contacts
                await supabase.from("customer_contacts").delete().eq("customer_id", targetCustomerId)
                if (values.contacts && values.contacts.length > 0) {
                    const contactInserts = values.contacts.map(contact => ({
                        customer_id: targetCustomerId,
                        name: contact.name,
                        role: contact.role,
                        email: contact.email,
                        phone: contact.phone,
                        is_primary: contact.is_primary,
                    }))
                    await supabase.from("customer_contacts").insert(contactInserts)
                }
            }

            router.push("/dashboard/customers")
            router.refresh()
        } catch (error) {
            console.error("Error saving customer:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Main Customer Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="store_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Store Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Pet Valu - Downtown" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="owner_manager_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Owner/Manager Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John Doe" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Status</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a status" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Qualified">Qualified</SelectItem>
                                                    <SelectItem value="Interested">Interested</SelectItem>
                                                    <SelectItem value="Not Qualified">Not Qualified</SelectItem>
                                                    <SelectItem value="Not Interested">Not Interested</SelectItem>
                                                    <SelectItem value="Dog Store">Dog Store</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="B2B">B2B</SelectItem>
                                                    <SelectItem value="B2C">B2C</SelectItem>
                                                    <SelectItem value="Affiliate">Affiliate</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="contact@example.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone</FormLabel>
                                            <FormControl>
                                                <Input placeholder="(555) 123-4567" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="website"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Website</FormLabel>
                                            <FormControl>
                                                <Input placeholder="https://example.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Address */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Address</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="street"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Street</FormLabel>
                                            <FormControl>
                                                <Input placeholder="123 Main St" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="city"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>City</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Toronto" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="province"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Province</FormLabel>
                                            <FormControl>
                                                <Input placeholder="ON" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="postal_code"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Postal Code</FormLabel>
                                            <FormControl>
                                                <Input placeholder="M5V 2T6" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Contacts */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle>Contacts</CardTitle>
                                <Button type="button" variant="outline" size="sm" onClick={() => append({ name: "", role: "", email: "", phone: "", is_primary: false })}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Contact
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex flex-col gap-4 p-4 border rounded-lg relative">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-2 right-2 text-destructive"
                                            onClick={() => remove(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name={`contacts.${index}.name`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Name</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Contact Name" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`contacts.${index}.role`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Role</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Manager" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`contacts.${index}.email`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Email</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="email@example.com" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`contacts.${index}.phone`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Phone</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Phone" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                ))}
                                {fields.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-4">No contacts added yet.</p>
                                )}
                            </CardContent>
                        </Card>

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Add any notes here..."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="space-y-8">
                        {/* Tags */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Tags</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <FormField
                                    control={form.control}
                                    name="tags"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Manage Tags</FormLabel>
                                            <FormControl>
                                                <TagSelector
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Social Media */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Social Media</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="facebook"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Facebook</FormLabel>
                                            <FormControl>
                                                <Input placeholder="https://facebook.com/..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="instagram"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Instagram</FormLabel>
                                            <FormControl>
                                                <Input placeholder="https://instagram.com/..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="tiktok"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>TikTok</FormLabel>
                                            <FormControl>
                                                <Input placeholder="https://tiktok.com/..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="youtube"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>YouTube</FormLabel>
                                            <FormControl>
                                                <Input placeholder="https://youtube.com/..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full md:w-auto">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {customerId ? "Update Customer" : "Create Customer"}
                </Button>
            </form>
        </Form>
    )
}
