import type { Metadata } from "next"
import CatalogClientPage from "./CatalogClientPage"

export const metadata: Metadata = {
  title: "Catálogo - Atelier da Rubi | Bordados Infantis em Arraial do Cabo",
  description:
    "Explore nosso catálogo completo de bordados infantis únicos. Vestidos, bodies, macacões e muito mais, criados com amor pela Rubiana Lima.",
  keywords: "catálogo bordado infantil, roupas bebê bordadas, vestidos infantis, bodies bordados, Arraial do Cabo",
}

export default function CatalogoPage() {
  return <CatalogClientPage />
}
