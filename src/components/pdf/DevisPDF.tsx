import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer"

// Enregistrement de la police Roboto
Font.register({
  family: "Roboto",
  fonts: [
    { src: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5Q.ttf", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmEU9vAw.ttf", fontWeight: 700 },
  ],
})

const styles = StyleSheet.create({
  page: { padding: 48, fontSize: 10, fontFamily: "Roboto", color: "#1e293b", backgroundColor: "#ffffff" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 32, paddingBottom: 24, borderBottomWidth: 2, borderBottomColor: "#1d4ed8" },
  title: { fontSize: 28, fontWeight: 700, color: "#1d4ed8", letterSpacing: 2 },
  subtitle: { fontSize: 10, color: "#64748b", marginTop: 4 },
  vendeurNom: { fontSize: 12, fontWeight: 700, color: "#1e293b", textAlign: "right" },
  vendeurInfo: { fontSize: 9, color: "#64748b", textAlign: "right", marginTop: 2 },
  datesBlock: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24, backgroundColor: "#eff6ff", padding: 12, borderRadius: 6 },
  dateItem: { flexDirection: "column", gap: 2 },
  dateLabel: { fontSize: 8, color: "#64748b", fontWeight: 700 },
  dateValue: { fontSize: 10, fontWeight: 700, color: "#1e293b" },
  partiesBlock: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  partieBox: { width: "45%" },
  partieTitle: { fontSize: 8, fontWeight: 700, color: "#1d4ed8", textTransform: "uppercase", marginBottom: 6, borderBottomWidth: 1, borderBottomColor: "#bfdbfe", paddingBottom: 4 },
  partieNom: { fontSize: 10, fontWeight: 700, color: "#1e293b", marginBottom: 2 },
  partieInfo: { fontSize: 9, color: "#64748b", marginBottom: 1 },
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
  
  montant: { fontFamily: "Helvetica", fontSize: 9 },
  montantHeader: { fontFamily: "Helvetica", fontWeight: 700, color: "#ffffff", fontSize: 9 },
  
  totalsBlock: { alignItems: "flex-end", marginTop: 12 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", width: 220, marginBottom: 4 },
  totalLabel: { color: "#64748b", fontSize: 9 },
  totalTTCBlock: { flexDirection: "row", justifyContent: "space-between", width: 220, backgroundColor: "#1d4ed8", padding: 5, borderRadius: 6, marginTop: 6 },
  totalTTCLabel: { fontWeight: 700, color: "#ffffff", fontSize: 11 },
  totalTTCValue: { fontWeight: 700, color: "#ffffff", fontSize: 11, fontFamily: "Helvetica" },
  signatureBlock: { flexDirection: "row", justifyContent: "space-between", marginTop: 32 },
  signatureBox: { width: "45%", borderTopWidth: 1, borderTopColor: "#cbd5e1", paddingTop: 8 },
  signatureSpace: { height: 60 },
  signatureLabel: { fontSize: 9, color: "#64748b" },
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
  prixUnitaireFormate?: string
  totalFormate?: string
}

interface Props {
  numeroDevis: string
  dateDevis: string
  dateValidite: string
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
    cgv?: string
  }
  lignes: LigneArticle[]
  remise: number
  montantRemiseFormate: string
  tva: number
  modePaiement: string
  conditionsReglement: string
  delaisLivraison: string
  sousTotalFormate: string
  totalHTFormate: string
  montantTvaFormate: string
  totalTTCFormate: string
  totalEnLettres: string
}

export default function DevisPDF({
  numeroDevis, dateDevis, dateValidite, client, vendeur,
  lignes, remise, montantRemiseFormate, tva, modePaiement,
  conditionsReglement, delaisLivraison,
  sousTotalFormate, totalHTFormate, montantTvaFormate, totalTTCFormate, totalEnLettres
}: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>DEVIS</Text>
            <Text style={styles.subtitle}>N° {numeroDevis}</Text>
          </View>
          <View>
            <Text style={styles.vendeurNom}>{vendeur.raisonSociale || vendeur.nom}</Text>
            {vendeur.adresse ? <Text style={styles.vendeurInfo}>{vendeur.adresse}</Text> : null}
            {vendeur.ville ? <Text style={styles.vendeurInfo}>{vendeur.ville}, {vendeur.pays}</Text> : null}
            <Text style={styles.vendeurInfo}>{vendeur.telephone}</Text>
            <Text style={styles.vendeurInfo}>{vendeur.email}</Text>
            {vendeur.numeroRCCM ? <Text style={styles.vendeurInfo}>RCCM : {vendeur.numeroRCCM}</Text> : null}
            {vendeur.numeroContribuable ? <Text style={styles.vendeurInfo}>NIU : {vendeur.numeroContribuable}</Text> : null}
          </View>
        </View>

        {/* Dates */}
        <View style={styles.datesBlock}>
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Date d'émission</Text>
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
          {delaisLivraison ? (
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>Délai de livraison</Text>
              <Text style={styles.dateValue}>{delaisLivraison}</Text>
            </View>
          ) : null}
        </View>

        {/* Parties */}
        <View style={styles.partiesBlock}>
          <View style={styles.partieBox}>
            <Text style={styles.partieTitle}>Prestataire</Text>
            <Text style={styles.partieNom}>{vendeur.raisonSociale || vendeur.nom}</Text>
            {vendeur.adresse ? <Text style={styles.partieInfo}>{vendeur.adresse}</Text> : null}
            {vendeur.ville ? <Text style={styles.partieInfo}>{vendeur.ville}, {vendeur.pays}</Text> : null}
            <Text style={styles.partieInfo}>{vendeur.telephone}</Text>
            {vendeur.numeroRCCM ? <Text style={styles.partieInfo}>RCCM : {vendeur.numeroRCCM}</Text> : null}
            {vendeur.numeroContribuable ? <Text style={styles.partieInfo}>NIU : {vendeur.numeroContribuable}</Text> : null}
          </View>
          <View style={styles.partieBox}>
            <Text style={styles.partieTitle}>Client</Text>
            <Text style={styles.partieNom}>{client.nom}</Text>
            {client.adresse ? <Text style={styles.partieInfo}>{client.adresse}</Text> : null}
            {client.telephone ? <Text style={styles.partieInfo}>{client.telephone}</Text> : null}
            {client.ifu ? <Text style={styles.partieInfo}>IFU : {client.ifu}</Text> : null}
          </View>
        </View>

        {/* Tableau */}
        <View style={styles.tableWrapper}>
          <Text style={styles.tableTitle}>Descriptif quantitatif et estimatif</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.col1, styles.colHeader]}>Désignation</Text>
            <Text style={[styles.col2, styles.colHeader]}>Catégorie</Text>
            <Text style={[styles.col3, styles.montantHeader]}>Qté</Text>
            <Text style={[styles.col4, styles.montantHeader]}>PU HT</Text>
            <Text style={[styles.col5, styles.montantHeader]}>Total HT</Text>
          </View>
          {lignes && lignes.map((ligne, i) => (
            <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={styles.col1}>{ligne.designation || ""}</Text>
              <Text style={styles.col2}>{ligne.categorie || ""}</Text>
              <Text style={[styles.col3, styles.montant]}>{ligne.quantite ?? 0}</Text>
              <Text style={[styles.col4, styles.montant]}>{ligne.prixUnitaireFormate || ligne.prixUnitaire} FCFA</Text>
              <Text style={[styles.col5, styles.montant]}>{ligne.totalFormate || ligne.total} FCFA</Text>
            </View>
          ))}
        </View>

        {/* Totaux */}
        <View style={styles.totalsBlock}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Sous-total HT</Text>
            <Text style={styles.montant}>{sousTotalFormate} FCFA</Text>
          </View>
          {remise > 0 ? (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Remise ({remise}%)</Text>
              <Text style={[styles.montant, { color: "#dc2626" }]}>- {montantRemiseFormate} FCFA</Text>
            </View>
          ) : null}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total HT</Text>
            <Text style={styles.montant}>{totalHTFormate} FCFA</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TVA ({tva}%)</Text>
            <Text style={styles.montant}>{montantTvaFormate} FCFA</Text>
          </View>
          <View style={styles.totalTTCBlock}>
            <Text style={styles.totalTTCLabel}>Total TTC</Text>
            <Text style={styles.totalTTCValue}>{totalTTCFormate} FCFA</Text>
          </View>
          <View style={{ marginTop: 6, padding: 8, backgroundColor: "#eff6ff", borderRadius: 4, width: 220 }}>
            <Text style={{ fontSize: 8, color: "#1d4ed8" }}>
              Arrêté à : {totalEnLettres}
            </Text>
          </View>
        </View>

        {/* Conditions */}
        {conditionsReglement ? (
          <View style={{ marginTop: 16, padding: 10, backgroundColor: "#f8fafc", borderRadius: 4 }}>
            <Text style={{ fontSize: 8, fontWeight: 700, color: "#64748b", marginBottom: 4 }}>
              CONDITIONS DE RÈGLEMENT
            </Text>
            <Text style={{ fontSize: 9, color: "#1e293b" }}>{conditionsReglement}</Text>
          </View>
        ) : null}

        {/* CGV */}
        {vendeur.cgv ? (
          <View style={{ marginTop: 10, borderTopWidth: 1, borderTopColor: "#e2e8f0", paddingTop: 8 }}>
            <Text style={{ fontSize: 8, fontWeight: 700, color: "#64748b", marginBottom: 4 }}>
              CONDITIONS GÉNÉRALES DE VENTE
            </Text>
            <Text style={{ fontSize: 8, color: "#94a3b8" }}>{vendeur.cgv}</Text>
          </View>
        ) : null}

        {/* Signatures */}
        <View style={styles.signatureBlock}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Le Prestataire</Text>
            <View style={styles.signatureSpace} />
            <Text style={styles.signatureLabel}>Nom & cachet : _______________</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Le Client — "Bon pour accord"</Text>
            <View style={styles.signatureSpace} />
            <Text style={styles.signatureLabel}>Lu et approuvé : _______________</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Devis valable jusqu'au {dateValidite}</Text>
          <Text style={styles.footerBrand}>Compta SaaS</Text>
        </View>

      </Page>
    </Document>
  )
}