"use server"

import { signIn } from "@/auth"
import { redirect } from "next/navigation"

export async function loginAction(formData: FormData) {
  const phone = formData.get("phone") as string
  const password = formData.get("password") as string

  try {
    await signIn("credentials", {
      phone,
      password,
      redirect: false,
    })
  } catch (error) {
    return { error: "Téléphone ou mot de passe incorrect" }
  }

  redirect("/dashboard")
}