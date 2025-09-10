import type React from "react"
import { CitizenLayout } from "@/components/citizen/citizen-layout"

export default function CitizenLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return <CitizenLayout>{children}</CitizenLayout>
}
