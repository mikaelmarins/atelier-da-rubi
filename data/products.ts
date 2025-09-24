export interface Product {
  id: number
  name: string
  images: string[]
  price: string
  category: string
  description: string
  featured?: boolean
  details: {
    material: string
    tamanhos: string[]
    cuidados: string
    tempo_producao: string
  }
}

export const products: Product[] = [
  {
    id: 1,
    name: "Kit Berço Premium",
    images: [
      "/placeholder.svg?height=600&width=600&text=Kit+Berço+1",
      "/placeholder.svg?height=600&width=600&text=Kit+Berço+2",
      "/placeholder.svg?height=600&width=600&text=Kit+Berço+3",
      "/placeholder.svg?height=600&width=600&text=Kit+Berço+4",
    ],
    price: "R$ 189,90",
    category: "jogos-berco",
    description: "Jogo de berço completo com bordados delicados e acabamento premium",
    featured: true,
    details: {
      material: "100% Algodão Premium",
      tamanhos: ["Berço Padrão", "Mini Berço"],
      cuidados: "Lavar à mão com água fria, secar à sombra",
      tempo_producao: "10 a 15 dias úteis",
    },
  },
  {
    id: 2,
    name: "Toalha Recém-Nascido Bordada",
    images: [
      "/placeholder.svg?height=600&width=600&text=Toalha+RN+1",
      "/placeholder.svg?height=600&width=600&text=Toalha+RN+2",
      "/placeholder.svg?height=600&width=600&text=Toalha+RN+3",
    ],
    price: "R$ 85,90",
    category: "toalhas",
    description: "Toalha premium com bordado personalizado e acabamento delicado",
    featured: true,
    details: {
      material: "100% Algodão Orgânico",
      tamanhos: ["70x70cm", "80x80cm"],
      cuidados: "Lavar à máquina em água fria, secar à sombra",
      tempo_producao: "5 a 7 dias úteis",
    },
  },
  {
    id: 3,
    name: "Kit Gestante Completo",
    images: [
      "/placeholder.svg?height=600&width=600&text=Kit+Gestante+1",
      "/placeholder.svg?height=600&width=600&text=Kit+Gestante+2",
      "/placeholder.svg?height=600&width=600&text=Kit+Gestante+3",
      "/placeholder.svg?height=600&width=600&text=Kit+Gestante+4",
      "/placeholder.svg?height=600&width=600&text=Kit+Gestante+5",
    ],
    price: "R$ 145,90",
    category: "kit-gestante",
    description: "Kit completo com bolsas e acessórios bordados para gestante",
    featured: true,
    details: {
      material: "Tecido Premium com Bordados",
      tamanhos: ["Único"],
      cuidados: "Lavar à mão, secar à sombra",
      tempo_producao: "7 a 10 dias úteis",
    },
  },
  {
    id: 4,
    name: "Jogo de Berço Laranja",
    images: [
      "/placeholder.svg?height=600&width=600&text=Berço+Laranja+1",
      "/placeholder.svg?height=600&width=600&text=Berço+Laranja+2",
      "/placeholder.svg?height=600&width=600&text=Berço+Laranja+3",
      "/placeholder.svg?height=600&width=600&text=Berço+Laranja+4",
    ],
    price: "R$ 225,90",
    category: "jogos-berco",
    description: "Jogo de berço em tons laranja com bordados delicados de flores",
    featured: true,
    details: {
      material: "100% Algodão Premium",
      tamanhos: ["Berço Padrão", "Mini Berço"],
      cuidados: "Lavar à mão com água fria, secar à sombra",
      tempo_producao: "12 a 15 dias úteis",
    },
  },
  {
    id: 5,
    name: "Kit Bolsas Maternidade Premium",
    images: [
      "/placeholder.svg?height=600&width=600&text=Bolsas+Maternidade+1",
      "/placeholder.svg?height=600&width=600&text=Bolsas+Maternidade+2",
      "/placeholder.svg?height=600&width=600&text=Bolsas+Maternidade+3",
    ],
    price: "R$ 165,90",
    category: "kit-gestante",
    description: "Kit com 3 bolsas bordadas para maternidade com acabamento premium",
    featured: true,
    details: {
      material: "Tecido Premium com Bordados Dourados",
      tamanhos: ["P", "M", "G"],
      cuidados: "Lavar à mão, secar à sombra",
      tempo_producao: "8 a 12 dias úteis",
    },
  },
  {
    id: 6,
    name: "Vestidinho Flores Delicadas",
    images: [
      "/placeholder.svg?height=600&width=600&text=Vestido+Flores+1",
      "/placeholder.svg?height=600&width=600&text=Vestido+Flores+2",
      "/placeholder.svg?height=600&width=600&text=Vestido+Flores+3",
    ],
    price: "R$ 89,90",
    category: "vestidos",
    description: "Vestido bordado à mão com flores em tons pastéis",
    details: {
      material: "100% Algodão Premium",
      tamanhos: ["RN", "P", "M", "G", "1 ano", "2 anos"],
      cuidados: "Lavar à mão com água fria, secar à sombra",
      tempo_producao: "7 a 10 dias úteis",
    },
  },
  {
    id: 7,
    name: "Body Borboletas Encantadas",
    images: [
      "/placeholder.svg?height=600&width=600&text=Body+Borboletas+1",
      "/placeholder.svg?height=600&width=600&text=Body+Borboletas+2",
    ],
    price: "R$ 45,90",
    category: "bodies",
    description: "Body com bordado de borboletas em cores suaves",
    details: {
      material: "100% Algodão Orgânico",
      tamanhos: ["RN", "P", "M", "G"],
      cuidados: "Lavar à máquina em água fria, secar à sombra",
      tempo_producao: "5 a 7 dias úteis",
    },
  },
  {
    id: 8,
    name: "Macacão Nuvens Sonhadoras",
    images: [
      "/placeholder.svg?height=600&width=600&text=Macacão+Nuvens+1",
      "/placeholder.svg?height=600&width=600&text=Macacão+Nuvens+2",
      "/placeholder.svg?height=600&width=600&text=Macacão+Nuvens+3",
    ],
    price: "R$ 75,90",
    category: "macacoes",
    description: "Macacão com bordado de nuvens e estrelinhas",
    details: {
      material: "100% Algodão Premium",
      tamanhos: ["RN", "P", "M", "G", "1 ano"],
      cuidados: "Lavar à máquina em água fria, secar à sombra",
      tempo_producao: "6 a 8 dias úteis",
    },
  },
  {
    id: 9,
    name: "Toalha Bordada Anjos",
    images: [
      "/placeholder.svg?height=600&width=600&text=Toalha+Anjos+1",
      "/placeholder.svg?height=600&width=600&text=Toalha+Anjos+2",
      "/placeholder.svg?height=600&width=600&text=Toalha+Anjos+3",
    ],
    price: "R$ 75,90",
    category: "toalhas",
    description: "Toalha com bordado de anjos em fio dourado",
    details: {
      material: "100% Algodão Premium",
      tamanhos: ["70x70cm", "80x80cm"],
      cuidados: "Lavar à mão com água fria, secar à sombra",
      tempo_producao: "5 a 7 dias úteis",
    },
  },
]

export const getFeaturedProducts = () => products.filter((product) => product.featured)
export const getProductById = (id: number) => products.find((product) => product.id === id)
export const getProductsByCategory = (category: string) =>
  category === "todos" ? products : products.filter((product) => product.category === category)
