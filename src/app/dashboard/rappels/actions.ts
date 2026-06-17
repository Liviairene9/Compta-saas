"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Resend } from "resend"
import twilio from "twilio"

const resend = new Resend(process.env.RESEND_API_KEY)
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export async function envoyerRappelEmailAction(factureId: string) {
  const session = await auth()
  if (!session) return { error: "Non connecté" }

  const facture = await prisma.invoice.findUnique({
    where: { id: factureId },
    include: { client: true, owner: true },
  })

  if (!facture) return { error: "Facture introuvable" }
  if (!facture.client.email) return { error: "Ce client n'a pas d'email enregistré" }

  try {
    await resend.emails.send({
      from: "Compta SaaS <onboarding@resend.dev>",
      to: facture.client.email,
      subject: `Rappel de paiement — Facture ${facture.number}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #1d4ed8;">Rappel de paiement</h2>
          <p>Bonjour <strong>${facture.client.name}</strong>,</p>
          <p>Nous vous rappelons que la facture <strong>${facture.number}</strong> 
          d'un montant de <strong>${facture.totalAmount.toLocaleString("fr-FR")} FCFA</strong> 
          est en attente de règlement.</p>
          ${facture.dueDate ? `<p>Date d'échéance : <strong>${new Date(facture.dueDate).toLocaleDateString("fr-FR")}</strong></p>` : ""}
          <p>Merci de procéder au paiement dans les meilleurs délais.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="color: #64748b; font-size: 12px;">
            ${(facture.owner as any).raisonSociale || facture.owner.name}<br/>
            ${facture.owner.phone}
          </p>
        </div>
      `,
    })
    return { success: true, message: "Email envoyé avec succès" }
  } catch (error) {
    console.error(error)
    return { error: "Erreur lors de l'envoi de l'email" }
  }
}

export async function envoyerRappelSMSAction(factureId: string) {
  const session = await auth()
  if (!session) return { error: "Non connecté" }

  const facture = await prisma.invoice.findUnique({
    where: { id: factureId },
    include: { client: true, owner: true },
  })

  if (!facture) return { error: "Facture introuvable" }
  if (!facture.client.phone) return { error: "Ce client n'a pas de numéro enregistré" }

  try {
    await twilioClient.messages.create({
      body: `Bonjour ${facture.client.name}, rappel de paiement pour la facture ${facture.number} d'un montant de ${facture.totalAmount.toLocaleString("fr-FR")} FCFA. Merci de régulariser au plus vite. — ${(facture.owner as any).raisonSociale || facture.owner.name}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: facture.client.phone,
    })
    return { success: true, message: "SMS envoyé avec succès" }
  } catch (error: any) {
    console.error(error)
    return { error: `Erreur SMS : ${error.message}` }
  }
}

export async function envoyerRappelWhatsAppAction(factureId: string) {
  const session = await auth()
  if (!session) return { error: "Non connecté" }

  const facture = await prisma.invoice.findUnique({
    where: { id: factureId },
    include: { client: true, owner: true },
  })

  if (!facture) return { error: "Facture introuvable" }
  if (!facture.client.phone) return { error: "Ce client n'a pas de numéro enregistré" }

  try {
    await twilioClient.messages.create({
      body: `Bonjour ${facture.client.name} 👋\n\nNous vous rappelons que la facture *${facture.number}* d'un montant de *${facture.totalAmount.toLocaleString("fr-FR")} FCFA* est en attente de paiement.\n\nMerci de régulariser au plus vite.\n\n— ${(facture.owner as any).raisonSociale || facture.owner.name}`,
      from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
      to: `whatsapp:${facture.client.phone}`,
    })
    return { success: true, message: "WhatsApp envoyé avec succès" }
  } catch (error: any) {
    console.error(error)
    return { error: `Erreur WhatsApp : ${error.message}` }
  }
}