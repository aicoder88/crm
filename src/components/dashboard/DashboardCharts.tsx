"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity } from "lucide-react"

const data = [
    { name: "Jan", total: 1200 },
    { name: "Feb", total: 2100 },
    { name: "Mar", total: 1800 },
    { name: "Apr", total: 2400 },
    { name: "May", total: 3200 },
    { name: "Jun", total: 3800 },
    { name: "Jul", total: 4200 },
]

export function DashboardCharts() {
    return (
        <Card className="col-span-4 glass border-white/5 overflow-hidden relative group shadow-[0_0_20px_rgba(0,0,0,0.2)] hover:shadow-[0_0_30px_rgba(120,50,255,0.1)] transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-medium relative z-10">
                    <Activity className="h-5 w-5 text-primary drop-shadow-[0_0_8px_rgba(120,50,255,0.8)]" />
                    <span className="text-white">Revenue Growth</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="pl-2 relative z-10">
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#7832FF" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#7832FF" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke="rgba(255,255,255,0.3)"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="rgba(255,255,255,0.3)"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(10, 10, 12, 0.8)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                                    color: '#fff',
                                    backdropFilter: 'blur(10px)'
                                }}
                                itemStyle={{ color: '#7832FF' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="total"
                                stroke="#7832FF"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorTotal)"
                                className="drop-shadow-[0_0_10px_rgba(120,50,255,0.5)]"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
