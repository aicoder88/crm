"use client"

import { useEffect, useState } from "react"
import { CustomerContact } from "@/types"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, User, Phone, Mail, Star } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface CustomerContactsProps {
    customerId: string
}

export function CustomerContacts({ customerId }: CustomerContactsProps) {
    const [contacts, setContacts] = useState<CustomerContact[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchContacts() {
            const { data, error } = await supabase
                .from("customer_contacts")
                .select("*")
                .eq("customer_id", customerId)
                .order("is_primary", { ascending: false })

            if (error) {
                console.error("Error fetching contacts:", error)
            } else {
                setContacts(data as CustomerContact[])
            }
            setLoading(false)
        }

        fetchContacts()
    }, [customerId])

    if (loading) {
        return <div>Loading contacts...</div>
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Contacts</CardTitle>
                <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Contact
                </Button>
            </CardHeader>
            <CardContent className="grid gap-6">
                {contacts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No contacts found.</p>
                ) : (
                    contacts.map((contact) => (
                        <div key={contact.id} className="flex items-center justify-between space-x-4">
                            <div className="flex items-center space-x-4">
                                <Avatar>
                                    <AvatarFallback>
                                        {contact.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")
                                            .toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-medium leading-none flex items-center gap-2">
                                        {contact.name}
                                        {contact.is_primary && (
                                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                        )}
                                    </p>
                                    <p className="text-sm text-muted-foreground">{contact.role}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                {contact.email && (
                                    <div className="flex items-center gap-1">
                                        <Mail className="h-3 w-3" />
                                        {contact.email}
                                    </div>
                                )}
                                {contact.phone && (
                                    <div className="flex items-center gap-1">
                                        <Phone className="h-3 w-3" />
                                        {contact.phone}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    )
}
