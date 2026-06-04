import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer"

Font.register({
  family: "Roboto",
  fonts: [
    { src: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5Q.ttf", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmEU9vAw.ttf", fontWeight: 700 },
  ],
})

const styles = StyleSheet.create({
  page: { padding: 48, fontSize: 10, fontFamily: "Roboto", color: "#1e293b", backgroundColor: "#ffffff" },

  // Header
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 32, paddingBottom: 24, borderBottomWidth: 2, borderBottomColor: "#1d4ed8" },
  titleBlock: { flexDirection: "column", gap: 4 },
  title: { fontSize: 28, fontWeight: 700, color: "#1d4ed8", letterSpacing: 2 },
  numeroDoc: { fontSize: 10, color: "#64748b", marginTop: 4 },
  vendeurBlock: { alignItems: "flex-end" },
  vendeurNom: { fontSize: 12, fontWeight: 700, color: "#1e293b", textAlign: "right" },
  vendeurInfo: { fontSize: 9, color: "#64748b", textAlign: "right", marginTop: 2 },

  // Infos dates
  datesBlock: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24, backgroundColor: "#eff6ff", padding: 12, borderRadius: 6 },
  dateItem: { flexDirection: "column", gap: 2 },
  dateLabel: { fontSize: 8, color: "#64748b", fontWeight: 700 },
  dateValue: { fontSize: 10, fontWeight: 700, color: "#1e293b" },

  // Parties
  partiesBlock: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  partieBox: { width: "45%" },
  partieTitle: { fontSize: 8, fontWeight: 700, color: "#1d4ed8", textTransform: "uppercase", marginBottom: 6, borderBottomWidth: 1, borderBottomColor: "#bfdbfe", paddingBottom: 4 },
  partieNom: { fontSize: 10, fontWeight: 700, color: "#1e293b", marginBottom: 2 },
  partieInfo: { fontSize: 9, color: "#64748b", marginBottom: 1 },

  // Tableau
  tableWrapper: { marginBottom: 20 },
  tableTitle: { fontSize: 9, fontWeight: 700, color: "#1d4ed8", textTransform: "uppercase", marginBottom: 8, letterSpacing: 1 },
  tableHeader: { flexDirection: "row", backgroundColor: "#1d4ed8", padding: 8, borderRadius: 4 },
  tableRow: { flexDirection: "row", padding: 8, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  tableRowAlt: { flexDirection: "row", padding: 8, backgroundColor: "#f8fafc", borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  col1: { flex: 3 },
  col2: { flex: 2 },
  col3: { flex: 1, textAlign: "right" },
  col4: { flex: 1, textAlign: "right" },
  col5: { flex: 1, textAlign: "right" },
  colHeader: { fontWeight: 700, color: "#ffffff", fontSize: 9 },

  // Totaux
  totalsBlock: { alignItems: "flex-end", marginTop: 12 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", width: 220, marginBottom: 4 },
  totalLabel: { color: "#64748b", fontSize: 9 },
  totalValue: { fontSize: 9, color: "#1e293b" },
  totalTTCBlock: { flexDirection: "row", justifyContent: "space-between", width: 220, backgroundColor: "#1d4ed8", padding: 10, borderRadius: 6, marginTop: 6 },
  totalTTCLabel: { fontWeight: 700, color: "#ffffff", fontSize: 11 },
  totalTTCValue: { fontWeight: 700, color: "#ffffff", fontSize: 11 },

  // Mode paiement
  paiementBlock: { marginTop: 16, flexDirection: "row", alignItems: "center", gap: 6 },
  paiementLabel: { fontSize: 9, color: "#64748b" },
  paiementValue: { fontSize: 9, fontWeight: 700, color: "#1e293b" },

  // CGV
  cgvBlock: { marginTop: 20, borderTopWidth: 1, borderTopColor: "#e2e8f0", paddingTop: 10 },
  cgvTitle: { fontSize: 8, fontWeight: 700, color: "#64748b", marginBottom: 4, textTransform: "uppercase" },
  cgvText: { fontSize: 8, color: "#94a3b8", lineHeight: 1.5 },

  // Footer
  footer: { position: "absolute", bottom: 30, left: 48, right: 48, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  footerText: { fontSize: 8, color: "#94a3b8" },
  footerBrand: { fontSize: 8, fontWeight: 700, color: "#1d4ed8" },
})

interface LigneArticle {
  id: number
  designation: string
  categorie: string
  quantite: number
  prixUnitaire: number
  total: number
}

interface Props {
  numeroDevis: string
  dateDevis: string
  dateValidite: string
  client: { nom: string; adresse: string; telephone: string }
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
    cgv?: string
  }
  lignes: LigneArticle[]
  tva: number
  modePaiement: string
  sousTotal: number
  montantTva: number
  totalTTC: number
}

export default function DevisPDF({
  numeroDevis, dateDevis, dateValidite, client, vendeur,
  lignes, tva, modePaiement, sousTotal, montantTva, totalTTC
}: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>DEVIS</Text>
            <Text style={styles.numeroDoc}>N° {numeroDevis}</Text>
          </View>
          <View style={styles.vendeurBlock}>
            <Text style={styles.vendeurNom}>{vendeur.raisonSociale || vendeur.nom}</Text>
            {vendeur.adresse ? <Text style={styles.vendeurInfo}>{vendeur.adresse}</Text> : null}
            {vendeur.ville ? <Text style={styles.vendeurInfo}>{vendeur.ville}, {vendeur.pays}</Text> : null}
            <Text style={styles.vendeurInfo}>{vendeur.telephone}</Text>
            <Text style={styles.vendeurInfo}>{vendeur.email}</Text>
            {vendeur.numeroRCCM ? <Text style={styles.vendeurInfo}>RCCM : {vendeur.numeroRCCM}</Text> : null}
            {vendeur.numeroContribuable ? <Text style={styles.vendeurInfo}>N° Contribuable : {vendeur.numeroContribuable}</Text> : null}
            {vendeur.numeroTVA ? <Text style={styles.vendeurInfo}>N° TVA : {vendeur.numeroTVA}</Text> : null}
          </View>
        </View>

        {/* Dates */}
        <View style={styles.datesBlock}>
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Date du devis</Text>
            <Text style={styles.dateValue}>{dateDevis}</Text>
          </View>
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Valide jusqu'au</Text>
            <Text style={styles.dateValue}>{dateValidite}</Text>
          </View>
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Mode de paiement</Text>
            <Text style={styles.dateValue}>{modePaiement}</Text>
          </View>
        </View>

        {/* Parties */}
        <View style={styles.partiesBlock}>
          <View style={styles.partieBox}>
            <Text style={styles.partieTitle}>Prestataire</Text>
            <Text style={styles.partieNom}>{vendeur.raisonSociale || vendeur.nom}</Text>
            {vendeur.adresse ? <Text style={styles.partieInfo}>{vendeur.adresse}</Text> : null}
            {vendeur.ville ? <Text style={styles.partieInfo}>{vendeur.ville}, {vendeur.pays}</Text> : null}
            <Text style={styles.partieInfo}>{vendeur.telephone}</Text>
          </View>
          <View style={styles.partieBox}>
            <Text style={styles.partieTitle}>Client</Text>
            <Text style={styles.partieNom}>{client.nom}</Text>
            {client.adresse ? <Text style={styles.partieInfo}>{client.adresse}</Text> : null}
            {client.telephone ? <Text style={styles.partieInfo}>{client.telephone}</Text> : null}
          </View>
        </View>

        {/* Tableau */}
        <View style={styles.tableWrapper}>
          <Text style={styles.tableTitle}>Détail des prestations</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.col1, styles.colHeader]}>Désignation</Text>
            <Text style={[styles.col2, styles.colHeader]}>Catégorie</Text>
            <Text style={[styles.col3, styles.colHeader]}>Qté</Text>
            <Text style={[styles.col4, styles.colHeader]}>Prix unit.</Text>
            <Text style={[styles.col5, styles.colHeader]}>Total</Text>
          </View>
          {lignes.map((ligne, i) => (
            <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={styles.col1}>{ligne.designation}</Text>
              <Text style={styles.col2}>{ligne.categorie}</Text>
              <Text style={styles.col3}>{ligne.quantite}</Text>
              <Text style={styles.col4}>{ligne.prixUnitaire.toLocaleString("fr-FR")} FCFA</Text>
              <Text style={styles.col5}>{ligne.total.toLocaleString("fr-FR")} FCFA</Text>
            </View>
          ))}
        </View>

        {/* Totaux */}
        <View style={styles.totalsBlock}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Sous-total HT</Text>
            <Text style={styles.totalValue}>{sousTotal.toLocaleString("fr-FR")} FCFA</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TVA ({tva}%)</Text>
            <Text style={styles.totalValue}>{montantTva.toLocaleString("fr-FR")} FCFA</Text>
          </View>
          <View style={styles.totalTTCBlock}>
            <Text style={styles.totalTTCLabel}>Total TTC</Text>
            <Text style={styles.totalTTCValue}>{totalTTC.toLocaleString("fr-FR")} FCFA</Text>
          </View>
        </View>

        {/* Mode paiement */}
        <View style={styles.paiementBlock}>
          <Text style={styles.paiementLabel}>Mode de règlement :</Text>
          <Text style={styles.paiementValue}>{modePaiement}</Text>
        </View>

        {/* CGV */}
        {vendeur.cgv ? (
          <View style={styles.cgvBlock}>
            <Text style={styles.cgvTitle}>Conditions générales de vente</Text>
            <Text style={styles.cgvText}>{vendeur.cgv}</Text>
          </View>
        ) : null}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Devis valable 30 jours à compter de la date d'émission</Text>
          <Text style={styles.footerBrand}>Compta SaaS</Text>
        </View>

      </Page>
    </Document>
  )
}