import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#1e293b" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30 },
  title: { fontSize: 24, fontFamily: "Helvetica-Bold", color: "#1d4ed8" },
  subtitle: { fontSize: 10, color: "#64748b", marginTop: 4 },
  infoBlock: { marginBottom: 20 },
  sectionTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#1d4ed8", marginBottom: 6, borderBottomWidth: 1, borderBottomColor: "#e2e8f0", paddingBottom: 4 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  label: { color: "#64748b" },
  value: { fontFamily: "Helvetica-Bold" },
  tableHeader: { flexDirection: "row", backgroundColor: "#eff6ff", padding: 8, borderRadius: 4, marginBottom: 4 },
  tableRow: { flexDirection: "row", padding: 8, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  col1: { flex: 3 }, col2: { flex: 2 }, col3: { flex: 1, textAlign: "right" },
  col4: { flex: 1, textAlign: "right" }, col5: { flex: 1, textAlign: "right" },
  colHeader: { fontFamily: "Helvetica-Bold", color: "#1d4ed8", fontSize: 9 },
  totals: { alignItems: "flex-end", marginTop: 10 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", width: 200, marginBottom: 4 },
  totalLine: { flexDirection: "row", justifyContent: "space-between", width: 200, borderTopWidth: 1, borderTopColor: "#1d4ed8", paddingTop: 6, marginTop: 4 },
  totalLabel: { color: "#64748b" },
  totalTTCLabel: { fontFamily: "Helvetica-Bold", color: "#1d4ed8", fontSize: 11 },
  totalTTCValue: { fontFamily: "Helvetica-Bold", color: "#1d4ed8", fontSize: 11 },
  footer: { marginTop: 40, borderTopWidth: 1, borderTopColor: "#e2e8f0", paddingTop: 10, textAlign: "center", color: "#94a3b8", fontSize: 9 },
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
  client: { nom: string; adresse: string; telephone: string }
  vendeur: { nom: string; telephone: string; email: string }
  lignes: LigneArticle[]
  tva: number
  modePaiement: string
  sousTotal: number
  montantTva: number
  totalTTC: number
}

export default function BonCommandePDF({ numeroBon, dateBon, client, vendeur, lignes, tva, modePaiement, sousTotal, montantTva, totalTTC }: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>BON DE COMMANDE</Text>
            <Text style={styles.subtitle}>N° {numeroBon}</Text>
          </View>
          <View>
            <Text style={[styles.value, { textAlign: "right" }]}>{vendeur.nom}</Text>
            <Text style={[styles.subtitle, { textAlign: "right" }]}>{vendeur.telephone}</Text>
            <Text style={[styles.subtitle, { textAlign: "right" }]}>{vendeur.email}</Text>
          </View>
        </View>

        <View style={styles.infoBlock}>
          <View style={styles.row}><Text style={styles.label}>Date :</Text><Text style={styles.value}>{dateBon}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Mode de paiement :</Text><Text style={styles.value}>{modePaiement}</Text></View>
        </View>

        <View style={styles.infoBlock}>
          <Text style={styles.sectionTitle}>Commandé par</Text>
          <Text style={styles.value}>{client.nom}</Text>
          {client.adresse ? <Text style={styles.label}>{client.adresse}</Text> : null}
          {client.telephone ? <Text style={styles.label}>{client.telephone}</Text> : null}
        </View>

        <View style={{ marginBottom: 20 }}>
          <Text style={styles.sectionTitle}>Articles commandés</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.col1, styles.colHeader]}>Désignation</Text>
            <Text style={[styles.col2, styles.colHeader]}>Catégorie</Text>
            <Text style={[styles.col3, styles.colHeader]}>Qté</Text>
            <Text style={[styles.col4, styles.colHeader]}>Prix unit.</Text>
            <Text style={[styles.col5, styles.colHeader]}>Total</Text>
          </View>
          {lignes.map((ligne, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.col1}>{ligne.designation}</Text>
              <Text style={styles.col2}>{ligne.categorie}</Text>
              <Text style={styles.col3}>{ligne.quantite}</Text>
              <Text style={styles.col4}>{ligne.prixUnitaire.toLocaleString("fr-FR")} FCFA</Text>
              <Text style={styles.col5}>{ligne.total.toLocaleString("fr-FR")} FCFA</Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}><Text style={styles.totalLabel}>Sous-total</Text><Text>{sousTotal.toLocaleString("fr-FR")} FCFA</Text></View>
          <View style={styles.totalRow}><Text style={styles.totalLabel}>TVA ({tva}%)</Text><Text>{montantTva.toLocaleString("fr-FR")} FCFA</Text></View>
          <View style={styles.totalLine}>
            <Text style={styles.totalTTCLabel}>Total TTC</Text>
            <Text style={styles.totalTTCValue}>{totalTTC.toLocaleString("fr-FR")} FCFA</Text>
          </View>
        </View>

        <Text style={styles.footer}>Bon de commande — Compta SaaS</Text>
      </Page>
    </Document>
  )
}