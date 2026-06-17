import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer"

// Enregistrement de la police Roboto
Font.register({
  family: "Roboto",
  fonts: [
    { src: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5Q.ttf", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmEU9vAw.ttf", fontWeight: 700 },
  ],
})

// Ta solution radicale pour le séparateur de milliers
const formatPrix = (prix: number) => {
  return (prix || 0).toLocaleString("fr-FR").replace(/\s/g, ".")
}

const styles = StyleSheet.create({
  page: { padding: 48, fontSize: 10, fontFamily: "Roboto", color: "#1e293b", backgroundColor: "#ffffff" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 32, paddingBottom: 24, borderBottomWidth: 2, borderBottomColor: "#1d4ed8" },
  title: { fontSize: 24, fontWeight: 700, color: "#1d4ed8", letterSpacing: 2 },
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
}

interface Props {
  numeroBon: string
  dateBon: string
  dateLivraison: string
  adresseLivraison?: string
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
  tva: number
  modePaiement: string
  conditionsReglement?: string
  sousTotal: number
  montantTva: number
  totalTTC: number
  totalEnLettres?: string
}

export default function BonCommandePDF({
  numeroBon, dateBon, dateLivraison, adresseLivraison, client, vendeur,
  lignes, tva, modePaiement, conditionsReglement,
  sousTotal, montantTva, totalTTC, totalEnLettres
}: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>BON DE COMMANDE</Text>
            <Text style={styles.subtitle}>N° {numeroBon}</Text>
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

        {/* Dates & Conditions Opérationnelles */}
        <View style={styles.datesBlock}>
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Date de commande</Text>
            <Text style={styles.dateValue}>{dateBon}</Text>
          </View>
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Date de livraison prévue</Text>
            <Text style={styles.dateValue}>{dateLivraison || "À préciser"}</Text>
          </View>
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Mode de paiement</Text>
            <Text style={styles.dateValue}>{modePaiement}</Text>
          </View>
        </View>

        {/* Parties prenantes */}
        <View style={styles.partiesBlock}>
          <View style={styles.partieBox}>
            <Text style={styles.partieTitle}>Fournisseur</Text>
            <Text style={styles.partieNom}>{vendeur.raisonSociale || vendeur.nom}</Text>
            {vendeur.adresse ? <Text style={styles.partieInfo}>{vendeur.adresse}</Text> : null}
            {vendeur.ville ? <Text style={styles.partieInfo}>{vendeur.ville}, {vendeur.pays}</Text> : null}
            <Text style={styles.partieInfo}>{vendeur.telephone}</Text>
          </View>
          <View style={styles.partieBox}>
            <Text style={styles.partieTitle}>Destinataire / Client</Text>
            <Text style={styles.partieNom}>{client.nom}</Text>
            {adresseLivraison || client.adresse ? (
              <Text style={styles.partieInfo}>
                Livraison à : {adresseLivraison || client.adresse}
              </Text>
            ) : null}
            {client.telephone ? <Text style={styles.partieInfo}>Tél : {client.telephone}</Text> : null}
            {client.ifu ? <Text style={styles.partieInfo}>IFU : {client.ifu}</Text> : null}
          </View>
        </View>

        {/* Tableau des articles */}
        <View style={styles.tableWrapper}>
          <Text style={styles.tableTitle}>Détail des marchandises commandées</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.col1, styles.colHeader]}>Désignation</Text>
            <Text style={[styles.col2, styles.colHeader]}>Catégorie</Text>
            <Text style={[styles.col3, styles.montantHeader]}>Qté</Text>
            <Text style={[styles.col4, styles.montantHeader]}>PU HT</Text>
            <Text style={[styles.col5, styles.montantHeader]}>Total HT</Text>
          </View>
          {(lignes || []).map((ligne, i) => (
            <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={styles.col1}>{ligne.designation}</Text>
              <Text style={styles.col2}>{ligne.categorie}</Text>
              <Text style={[styles.col3, styles.montant]}>{ligne.quantite}</Text>
              <Text style={[styles.col4, styles.montant]}>{formatPrix(ligne.prixUnitaire)} FCFA</Text>
              <Text style={[styles.col5, styles.montant]}>{formatPrix(ligne.total)} FCFA</Text>
            </View>
          ))}
        </View>

        {/* Bloc Financier */}
        <View style={styles.totalsBlock}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Sous-total HT</Text>
            <Text style={styles.montant}>{formatPrix(sousTotal)} FCFA</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TVA ({tva}%)</Text>
            <Text style={styles.montant}>{formatPrix(montantTva)} FCFA</Text>
          </View>
          <View style={styles.totalTTCBlock}>
            <Text style={styles.totalTTCLabel}>Total TTC</Text>
            <Text style={styles.totalTTCValue}>{formatPrix(totalTTC)} FCFA</Text>
          </View>
          {totalEnLettres ? (
            <View style={{ marginTop: 6, padding: 8, backgroundColor: "#eff6ff", borderRadius: 4, width: 220 }}>
              <Text style={{ fontSize: 8, color: "#1d4ed8" }}>
                Arrêté à la somme de : {totalEnLettres}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Informations complémentaires de livraison */}
        {conditionsReglement ? (
          <View style={{ marginTop: 16, padding: 10, backgroundColor: "#f8fafc", borderRadius: 4 }}>
            <Text style={{ fontSize: 8, fontWeight: 700, color: "#64748b", marginBottom: 4 }}>
              CONDITIONS DE RÈGLEMENT ET LOGISTIQUE
            </Text>
            <Text style={{ fontSize: 9, color: "#1e293b" }}>{conditionsReglement}</Text>
          </View>
        ) : null}

        {/* Zones de validation réglementaires pour un Bon de commande */}
        <View style={styles.signatureBlock}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Pour le Client (Donneur d'ordre)</Text>
            <View style={styles.signatureSpace} />
            <Text style={styles.signatureLabel}>Date, Signature & Cachet</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Pour le Fournisseur (Acceptation)</Text>
            <View style={styles.signatureSpace} />
            <Text style={styles.signatureLabel}>Signature de confirmation</Text>
          </View>
        </View>

        {/* Footer unifié */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Document contractuel de commande N° {numeroBon}</Text>
          <Text style={styles.footerBrand}>Compta SaaS</Text>
        </View>

      </Page>
    </Document>
  )
}