"use client"

import { useState } from "react"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export type ProductColor = {
    name: string
    hex: string
}

interface ColorsEditorProps {
    colors: ProductColor[]
    onChange: (colors: ProductColor[]) => void
}

const PRESET_COLORS = [
    { name: "Branco", hex: "#FFFFFF" },
    { name: "Preto", hex: "#000000" },
    { name: "Rosa Bebê", hex: "#FFC0CB" },
    { name: "Azul Bebê", hex: "#89CFF0" },
    { name: "Verde Água", hex: "#98FF98" },
    { name: "Lilás", hex: "#C8A2C8" },
    { name: "Amarelo", hex: "#FFFFE0" },
    { name: "Cinza", hex: "#808080" },
    { name: "Bege", hex: "#F5F5DC" },
    { name: "Marinho", hex: "#000080" },
]

export default function ColorsEditor({ colors, onChange }: ColorsEditorProps) {
    const [newColorName, setNewColorName] = useState("")
    const [newColorHex, setNewColorHex] = useState("#000000")

    const addColor = () => {
        if (!newColorName) return
        onChange([...colors, { name: newColorName, hex: newColorHex }])
        setNewColorName("")
        setNewColorHex("#000000")
    }

    const removeColor = (index: number) => {
        const next = [...colors]
        next.splice(index, 1)
        onChange(next)
    }

    const addPreset = (preset: ProductColor) => {
        // Evitar duplicatas pelo nome
        if (colors.some((c) => c.name === preset.name)) return
        onChange([...colors, preset])
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-4">
                {PRESET_COLORS.map((preset) => (
                    <button
                        key={preset.name}
                        type="button"
                        onClick={() => addPreset(preset)}
                        className="w-6 h-6 rounded-full border shadow-sm hover:scale-110 transition-transform"
                        style={{ backgroundColor: preset.hex }}
                        title={`Adicionar ${preset.name}`}
                    />
                ))}
            </div>

            <div className="flex gap-2 items-end">
                <div className="flex-1 space-y-2">
                    <Label htmlFor="colorName">Nome da Cor</Label>
                    <Input
                        id="colorName"
                        value={newColorName}
                        onChange={(e) => setNewColorName(e.target.value)}
                        placeholder="Ex: Azul Royal"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="colorHex">Tom</Label>
                    <div className="flex items-center gap-2">
                        <Input
                            id="colorHex"
                            type="color"
                            value={newColorHex}
                            onChange={(e) => setNewColorHex(e.target.value)}
                            className="w-12 h-10 p-1 cursor-pointer"
                        />
                    </div>
                </div>
                <Button type="button" onClick={addColor} variant="secondary">
                    <Plus className="h-4 w-4" />
                </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
                {colors.map((color, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-between p-2 rounded-md border bg-gray-50"
                    >
                        <div className="flex items-center gap-2">
                            <div
                                className="w-4 h-4 rounded-full border"
                                style={{ backgroundColor: color.hex }}
                            />
                            <span className="text-sm font-medium">{color.name}</span>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeColor(index)}
                            className="h-6 w-6 p-0 text-gray-500 hover:text-red-500"
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                ))}
            </div>

            {colors.length === 0 && (
                <p className="text-sm text-gray-500 italic">Nenhuma cor selecionada.</p>
            )}
        </div>
    )
}
