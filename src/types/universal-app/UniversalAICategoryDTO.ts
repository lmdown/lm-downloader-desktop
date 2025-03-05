import { UniversalAIAppDTO } from "./UniversalAIAppDTO"

export interface UniversalAICategoryDTO {
  id?: string
  name_en: string
  name_zh: string
  icon?: string
  shortDesc?: string
  alias?: string
  subCats?: UniversalAICategoryDTO[]
  apps?: UniversalAIAppDTO[]
}
