"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Baby, Bath, BedDouble, Star } from 'lucide-react'

const categories = [
    {
        name: "Kits de Berço",
        icon: BedDouble,
        color: "bg-pink-100 text-pink-600",
        href: "/catalogo?categoria=Kit Berço",
    },
    {
        name: "Toalhas & Banho",
        icon: Bath,
        color: "bg-blue-100 text-blue-600",
        href: "/catalogo?categoria=Banho",
    },
    {
        name: "Ninhos & Mantas",
        icon: Baby,
        color: "bg-purple-100 text-purple-600",
        href: "/catalogo?categoria=Ninhos",
    },
    {
        name: "Linha Premium",
        icon: Star,
        color: "bg-yellow-100 text-yellow-600",
        href: "/catalogo?destaque=true",
    },
]

export default function VisualCategories() {
    return (
        <section className="py-12 bg-white">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {categories.map((category, index) => (
                        <motion.div
                            key={category.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <Link href={category.href} className="group block text-center">
                                <div
                                    className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${category.color}`}
                                >
                                    <category.icon className="w-10 h-10" />
                                </div>
                                <h3 className="font-medium text-gray-800 group-hover:text-pink-600 transition-colors">
                                    {category.name}
                                </h3>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
