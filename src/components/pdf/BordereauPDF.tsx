import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer"

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
  title: { fontSize: 20, fontWeight: 700, color: "#1d4ed8" },
  subtitle: { fontSize: 11, fontWeight: 700, color: "#475569", marginTop: 4 },
  vendeurNom: { fontSize: 12, fontWeight: 700, textAlign: "right" },
  vendeurInfo: { fontSize: 8.5, color: "#64748b", textAlign: "right", marginTop: 2 },
  datesBlock: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20, backgroundColor: "#eff6ff", padding: 10, borderRadius: 6 },
  dateItem: { flexDirection: "column", gap: 2 },
  dateLabel: { fontSize: 7.5, color: "#64748b", fontWeight: 700 },
  dateValue: { fontSize: 9, fontWeight: 700, color: "#1e293b" },
  partiesBlock: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  partieBox: { width: "48%", padding: 8, backgroundColor: "#f8fafc", borderRadius: 6, borderWidth: 1, borderColor: "#e2e8f0" },
  partieTitle: { fontSize: 8, fontWeight: 700, color: "#1d4ed8", textTransform: "uppercase", marginBottom: 6, borderBottomWidth: 1, borderBottomColor: "#cbd5e1", paddingBottom: 4 },
  partieNom: { fontSize: 10, fontWeight: 700, color: "#1e293b", marginBottom: 4 },
  partieInfo: { fontSize: 8.5, color: "#475569", marginBottom: 2 },
  tableWrapper: { marginBottom: 20 },
  tableTitle: { fontSize: 9, fontWeight: 700, color: "#1d4ed8", textTransform: "uppercase", marginBottom: 6 },
  tableHeader: { flexDirection: "row", backgroundColor: "#1d4ed8", padding: 6, borderRadius: 4 },
  tableRow: { flexDirection: "row", padding: 6, borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  tableRowAlt: { flexDirection: "row", padding: 6, backgroundColor: "#f8fafc", borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  colHeader: { fontWeight: 700, color: "#ffffff", fontSize: 8.5 },
  col1: { flex: 5 },
  col2: { flex: 2 },
  col3: { flex: 1.5, textAlign: "center" },
  obsBlock: { marginBottom: 20, padding: 10, backgroundColor: "#fefce8", borderRadius: 6, borderWidth: 1, borderColor: "#fde68a" },
  obsTitle: { fontSize: 8, fontWeight: 700, color: "#92400e", marginBottom: 4 },
  obsText: { fontSize: 8.5, color: "#78350f" },
  signatureBlock: { flexDirection: "row", justifyContent: "space-between", marginTop: 24 },
  signatureBox: { width: "47%", borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 6, padding: 8 },
  signatureTitle: { fontSize: 8, fontWeight: 700, color: "#334155", marginBottom: 4 },
  signatureSpace: { height: 55 },
  signatureLabel: { fontSize: 7.5, color: "#64748b" },
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
  dateBordereau: string
  dateLivraison: string
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
  }
  lignes: LigneArticle[]
  observations: string
}

export default function BordereauPDF({
  numeroBordereau, dateBordereau, dateLivraison, adresseLivraison,
  client, vendeur, lignes, observations
}: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>BORDEREAU DE LIVRAISON</Text>
            <Text style={styles.subtitle}>N° {numeroBordereau}</Text>
          </View>
          <View>
            <Text style={styles.vendeurNom}>{vendeur.raisonSociale || vendeur.nom}</Text>
            {vendeur.adresse ? <Text style={styles.vendeurInfo}>{vendeur.adresse}{vendeur.ville ? `, ${vendeur.ville}` : ""}</Text> : null}
            <Text style={styles.vendeurInfo}>Tél : {vendeur.telephone}</Text>
            {vendeur.numeroRCCM ? <Text style={styles.vendeurInfo}>RCCM : {vendeur.numeroRCCM}</Text> : null}
            {vendeur.numeroContribuable ? <Text style={styles.vendeurInfo}>NIU : {vendeur.numeroContribuable}</Text> : null}
          </View>
        </View>

        {/* Dates */}
        <View style={styles.datesBlock}>
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Date d'émission</Text>
            <Text style={styles.dateValue}>{dateBordereau}</Text>
          </View>
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Date de livraison prévue</Text>
            <Text style={styles.dateValue}>{dateLivraison}</Text>
          </View>
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Lieu de livraison</Text>
            <Text style={styles.dateValue}>{adresseLivraison || "—"}</Text>
          </View>
        </View>

        {/* Parties */}
        <View style={styles.partiesBlock}>
          <View style={styles.partieBox}>
            <Text style={styles.partieTitle}>Expéditeur</Text>
            <Text style={styles.partieNom}>{vendeur.raisonSociale || vendeur.nom}</Text>
            {vendeur.adresse ? <Text style={styles.partieInfo}>{vendeur.adresse}</Text> : null}
            <Text style={styles.partieInfo}>Tél : {vendeur.telephone}</Text>
            {vendeur.numeroRCCM ? <Text style={styles.partieInfo}>RCCM : {vendeur.numeroRCCM}</Text> : null}
          </View>
          <View style={styles.partieBox}>
            <Text style={styles.partieTitle}>Destinataire</Text>
            <Text style={styles.partieNom}>{client.nom}</Text>
            {client.adresse ? <Text style={styles.partieInfo}>{client.adresse}</Text> : null}
            {client.telephone ? <Text style={styles.partieInfo}>Tél : {client.telephone}</Text> : null}
            {client.ifu ? <Text style={styles.partieInfo}>IFU : {client.ifu}</Text> : null}
          </View>
        </View>

        {/* Tableau */}
        <View style={styles.tableWrapper}>
          <Text style={styles.tableTitle}>Désignation des marchandises</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.col1, styles.colHeader]}>Désignation</Text>
            <Text style={[styles.col2, styles.colHeader]}>Catégorie</Text>
            <Text style={[styles.col3, styles.colHeader]}>Qté</Text>
          </View>
          {lignes.map((ligne, i) => (
  <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
    <Text style={styles.col1}>{ligne.designation || ""}</Text>
    <Text style={styles.col2}>{ligne.categorie || "—"}</Text>
    <Text style={styles.col3}>{String(ligne.quantite ?? 0)}</Text>
  </View>
))}
        </View>

        {/* Observations */}
        {observations ? (
          <View style={styles.obsBlock}>
            <Text style={styles.obsTitle}>OBSERVATIONS / RÉSERVES DE TRANSPORT</Text>
            <Text style={styles.obsText}>{observations}</Text>
          </View>
        ) : null}

        {/* Signatures */}
        <View style={styles.signatureBlock}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>Pour le Livreur / Expéditeur</Text>
            <View style={styles.signatureSpace} />
            <Text style={styles.signatureLabel}>Signature & Cachet commercial</Text>
            <Text style={styles.signatureLabel}>Nom Responsable : _______________</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>Pour le Réceptionnaire — "Bon pour accord de réception"</Text>
            <View style={styles.signatureSpace} />
            <Text style={styles.signatureLabel}>Date, Signature & Cachet du client</Text>
            <Text style={styles.signatureLabel}>Nom Réceptionnaire : _______________</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Bordereau de livraison — conforme aux normes OHADA</Text>
          <Text style={styles.footerBrand}>Compta SaaS</Text>
        </View>

      </Page>
    </Document>
  )
}