"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface DetailsEditorProps {
    value: Record<string, any>
    onChange: (value: Record<string, any>) => void
}

export default function DetailsEditor({ value, onChange }: DetailsEditorProps) {
    const [entries, setEntries] = useState<[string, any][]>([])

    useEffect(() => {
        if (value) {
            setEntries(Object.entries(value))
        }
    }, [value])

    const handleAdd = () => {
        setEntries([...entries, ["", ""]])
    }

    const handleRemove = (index: number) => {
        const newEntries = entries.filter((_, i) => i !== index)
        setEntries(newEntries)
        updateParent(newEntries)
    }

    const handleChange = (index: number, key: string, val: string) => {
        const newEntries = [...entries]
        newEntries[index] = [key, val]
        setEntries(newEntries)
        updateParent(newEntries)
    }

    const updateParent = (currentEntries: [string, any][]) => {
        const newValue = Object.fromEntries(currentEntries.filter(([k]) => k.trim() !== ""))
        onChange(newValue)
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <Label>Detalhes Adicionais (Ex: Coleção, Itens Inclusos)</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAdd}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Campo
                </Button>
            </div>

            {entries.length === 0 && (
                <p className="text-sm text-gray-500 italic">Nenhum detalhe adicional.</p>
            )}

            <div className="space-y-3">
                {entries.map(([key, val], index) => (
                    <div key={index} className="flex gap-2 items-start">
                        <div className="flex-1">
                            <Input
                                placeholder="Nome do Campo (ex: Coleção)"
                                value={key}
                                onChange={(e) => handleChange(index, e.target.value, val)}
                            />
                        </div>
                        <div className="flex-1">
                            <Input
                                placeholder="Valor (ex: Safari Baby)"
                                value={val}
                                onChange={(e) => handleChange(index, key, e.target.value)}
                            />
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleRemove(index)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    )
}
