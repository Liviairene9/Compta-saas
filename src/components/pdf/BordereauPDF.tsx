import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer"

// Enregistrement stable de Roboto (uniquement Normal et Bold)
Font.register({
  family: "Roboto",
  fonts: [
    { src: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5Q.ttf", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmEU9vAw.ttf", fontWeight: 700 },
  ],
})

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Roboto", color: "#1e293b" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24, paddingBottom: 16, borderBottomWidth: 2, borderBottomColor: "#1d4ed8" },
  title: { fontSize: 20, fontWeight: 700, color: "#1d4ed8", textTransform: "uppercase" },
  subtitle: { fontSize: 11, fontWeight: 700, color: "#475569", marginTop: 4 },
  vendeurNom: { fontSize: 12, fontWeight: 700, textAlign: "right" },
  vendeurInfo: { fontSize: 8.5, color: "#64748b", textAlign: "right", marginTop: 2 },
  
  logistiqueBlock: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20, backgroundColor: "#eff6ff", padding: 10, borderRadius: 6, borderWidth: 1, borderColor: "#bfdbfe" },
  logistiqueItem: { flexDirection: "column", gap: 2, flex: 1 },
  logistiqueLabel: { fontSize: 7.5, color: "#64748b", fontWeight: 700, textTransform: "uppercase" },
  logistiqueValue: { fontSize: 9, fontWeight: 700, color: "#1e293b" },

  partiesBlock: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  partieBox: { width: "48%", padding: 8, backgroundColor: "#f8fafc", borderRadius: 6, borderWidth: 1, borderColor: "#e2e8f0" },
  partieTitle: { fontSize: 8, fontWeight: 700, color: "#1d4ed8", textTransform: "uppercase", marginBottom: 6, borderBottomWidth: 1, borderBottomColor: "#cbd5e1", paddingBottom: 4 },
  partieNom: { fontSize: 10, fontWeight: 700, color: "#1e293b", marginBottom: 4 },
  partieInfo: { fontSize: 8.5, color: "#475569", marginBottom: 2 },

  tableWrapper: { marginBottom: 20 },
  tableTitle: { fontSize: 9, fontWeight: 700, color: "#1d4ed8", textTransform: "uppercase", marginBottom: 6, letterSpacing: 0.5 },
  tableHeader: { flexDirection: "row", backgroundColor: "#1d4ed8", padding: 6, borderRadius: 4 },
  tableRow: { flexDirection: "row", padding: 6, borderBottomWidth: 1, borderBottomColor: "#e2e8f0", alignItems: "center" },
  tableRowAlt: { flexDirection: "row", padding: 6, backgroundColor: "#f8fafc", borderBottomWidth: 1, borderBottomColor: "#e2e8f0", alignItems: "center" },
  colHeader: { fontWeight: 700, color: "#ffffff", fontSize: 8.5 },
  col1: { flex: 5 },
  col2: { flex: 2, textTransform: "uppercase", color: "#64748b", fontSize: 8 },
  col3: { flex: 1.5, textAlign: "center" },

  conditionsBlock: { marginBottom: 20, padding: 10, backgroundColor: "#fefce8", borderRadius: 6, borderWidth: 1, borderColor: "#fde68a" },
  conditionsTitle: { fontSize: 8, fontWeight: 700, color: "#92400e", marginBottom: 4, textTransform: "uppercase" },
  conditionsText: { fontSize: 8.5, color: "#78350f", lineHeight: 1.4 },

  paiementBlock: { marginBottom: 24, padding: 8, borderRadius: 6, borderWidth: 1, textAlign: "center" },
  paiementTitle: { fontSize: 9, fontWeight: 700 },

  signatureBlock: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  signatureBox: { width: "31%", borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 6, padding: 6, backgroundColor: "#fafafa" },
  signatureTitle: { fontSize: 8, fontWeight: 700, color: "#334155", textTransform: "uppercase", marginBottom: 4, borderBottomWidth: 1, borderBottomColor: "#e2e8f0", paddingBottom: 2 },
  signatureLabel: { fontSize: 7.5, color: "#64748b", marginTop: 4 },
  signatureSpace: { height: 45 },
  signatureDriver: { fontSize: 7, color: "#475569", marginTop: 4 },
  signatureSubtitle: { fontSize: 6, color: "#94a3b8", marginTop: 4 }, // Nettoyé : fontStyle retiré pour éviter l'erreur

  footer: { position: "absolute", bottom: 25, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#e2e8f0", paddingTop: 8 },
  footerText: { fontSize: 7.5, color: "#94a3b8" },
  footerBrand: { fontSize: 8, fontWeight: 700, color: "#1d4ed8" },
})

interface LigneArticle {
  id: number
  designation: string
  categorie: string
  quantite: number
}

interface Props {
  numeroBordereau: string
  dateBordereau: string | Date
  dateLivraison: string | Date
  adresseLivraison: string
  client: { nom: string; adresse: string; telephone: string; ifu?: string }
  vendeur: {
    nom: string
    telephone: string
    email: string
    raisonSociale?: string
    adresse?: string
    ville?: string
    pays?: string
    numeroRCCM?: string
    numeroContribuable?: string
    numeroTVA?: string
  }
  lignes: LigneArticle[]
  livreur: string
  modeTransport: string
  immatriculation: string
  nombreColis: number
  conditionsLivraison: string
  payeALaLivraison: boolean
}

export default function BordereauPDF({
  numeroBordereau, dateBordereau, dateLivraison, adresseLivraison, client, vendeur,
  lignes, livreur, modeTransport, immatriculation, nombreColis, conditionsLivraison, payeALaLivraison
}: Props) {

  const formatStringDate = (d: string | Date) => {
    if (d instanceof Date) return d.toLocaleDateString("fr-FR")
    return d
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* Header Entête */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Bordereau de Livraison</Text>
            <Text style={styles.subtitle}>N° {numeroBordereau}</Text>
          </View>
          <View>
            <Text style={styles.vendeurNom}>{vendeur.raisonSociale || vendeur.nom}</Text>
            {vendeur.adresse ? <Text style={styles.vendeurInfo}>{vendeur.adresse}, {vendeur.ville}</Text> : null}
            <Text style={styles.vendeurInfo}>Tél : {vendeur.telephone} | Email : {vendeur.email}</Text>
            {vendeur.numeroRCCM ? <Text style={styles.vendeurInfo}>RCCM : {vendeur.numeroRCCM}</Text> : null}
            {vendeur.numeroContribuable ? <Text style={styles.vendeurInfo}>NUI / Contribuable : {vendeur.numeroContribuable}</Text> : null}
          </View>
        </View>

        {/* Métadonnées de Suivi Logistique */}
        <View style={styles.logistiqueBlock}>
          <View style={styles.logistiqueItem}>
            <Text style={styles.logistiqueLabel}>Date Émission</Text>
            <Text style={styles.logistiqueValue}>{formatStringDate(dateBordereau)}</Text>
          </View>
          <View style={styles.logistiqueItem}>
            <Text style={styles.logistiqueLabel}>Date Réception prévue</Text>
            <Text style={styles.logistiqueValue}>{formatStringDate(dateLivraison)}</Text>
          </View>
          <View style={styles.logistiqueItem}>
            <Text style={styles.logistiqueLabel}>Mode Transport</Text>
            <Text style={styles.logistiqueValue}>{modeTransport || "—"} {immatriculation ? `(${immatriculation})` : ""}</Text>
          </View>
          <View style={styles.logistiqueItem}>
            <Text style={styles.logistiqueLabel}>Colisage</Text>
            <Text style={styles.logistiqueValue}>{nombreColis || 0} Colis</Text>
          </View>
        </View>

        {/* Identification des Flux d'Acteurs */}
        <View style={styles.partiesBlock}>
          <View style={styles.partieBox}>
            <Text style={styles.partieTitle}>Lieu de Chargement (Expéditeur)</Text>
            <Text style={styles.partieNom}>{vendeur.raisonSociale || vendeur.nom}</Text>
            {vendeur.adresse ? <Text style={styles.partieInfo}>Adresse : {vendeur.adresse}</Text> : null}
            <Text style={styles.partieInfo}>Tél : {vendeur.telephone}</Text>
          </View>
          
          <View style={styles.partieBox}>
            <Text style={styles.partieTitle}>Lieu de Déchargement (Destinataire)</Text>
            <Text style={styles.partieNom}>{client.nom}</Text>
            <Text style={styles.partieInfo}>Lieu effectif : {adresseLivraison || client.adresse}</Text>
            {client.telephone ? <Text style={styles.partieInfo}>Tél : {client.telephone}</Text> : null}
            {client.ifu ? <Text style={styles.partieInfo}>NIU / IFU Client : {client.ifu}</Text> : null}
          </View>
        </View>

        {/* Corps du Document */}
        <View style={styles.tableWrapper}>
          <Text style={styles.tableTitle}>Marchandises Transportées</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.col1, styles.colHeader]}>Désignation de la marchandise</Text>
            <Text style={[styles.col2, styles.colHeader]}>Catégorie</Text>
            <Text style={[styles.col3, styles.colHeader, { textAlign: "center" }]}>Qté Expédiée</Text>
          </View>
          {lignes && lignes.map((ligne, i) => (
            <View key={ligne.id || i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={styles.col1}>{ligne.designation}</Text>
              <Text style={styles.col2}>{ligne.categorie || "—"}</Text>
              <Text style={styles.col3}>{ligne.quantite}</Text>
            </View>
          ))}
        </View>

        {/* Consignes particulières */}
        {conditionsLivraison ? (
          <View style={styles.conditionsBlock}>
            <Text style={styles.conditionsTitle}>Instructions de manutention et livraison</Text>
            <Text style={styles.conditionsText}>{conditionsLivraison}</Text>
          </View>
        ) : null}

        {/* Alerte Contre-remboursement */}
        <View style={[styles.paiementBlock, {
          backgroundColor: payeALaLivraison ? "#f0fdf4" : "#fafafa",
          borderColor: payeALaLivraison ? "#86efac" : "#cbd5e1",
        }]}>
          <Text style={[styles.paiementTitle, { color: payeALaLivraison ? "#15803d" : "#475569" }]}>
            {payeALaLivraison ? "⚠️ ENCAISSEMENT REQUIS : CONTRE-REMBOURSEMENT À LA LIVRAISON" : "LIVRAISON STANDARD SANS ENCAISSEMENT IMMÉDIAT"}
          </Text>
        </View>

        {/* Zone d'émargement */}
        <View style={styles.signatureBlock}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>1. Visa Magasin</Text>
            <View style={styles.signatureSpace} />
            <Text style={styles.signatureLabel}>Date : __ / __ / 20__</Text>
          </View>
          
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>2. Prise en Charge</Text>
            <Text style={styles.signatureDriver}>Chauffeur : {livreur || "________________"}</Text>
            <View style={{ height: 35 }} />
            <Text style={styles.signatureLabel}>Signature :</Text>
          </View>
          
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>3. Décharge Client</Text>
            <Text style={styles.signatureSubtitle}>Réserves : Mqts / Avaries...</Text>
            <View style={{ height: 35 }} />
            <Text style={styles.signatureLabel}>Date, Heure & Cachet</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Bordereau de livraison servant de justificatif de transfert de risques conforme aux normes OHADA.</Text>
          <Text style={styles.footerBrand}>Compta SaaS</Text>
        </View>

      </Page>
    </Document>
  )
}