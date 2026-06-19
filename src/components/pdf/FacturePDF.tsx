import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"

// On définit des interfaces claires pour éviter tout problème d'undefined
interface LignePDF {
  designation: string
  categorie: string
  quantite: number
  prixUnitaireFormate?: string // Version corrigée avec les points
  totalFormate?: string        // Version corrigée avec les points
  prixUnitaire?: number        // Fallback au cas où
  total?: number               // Fallback au cas où
}

interface FacturePDFProps {
  numeroFacture: string
  dateFacture: string
  dateEcheance: string
  client: { nom: string; adresse: string; telephone: string }
  vendeur: {
    nom: string
    telephone: string
    email: string
    raisonSociale?: string
    adresse?: string
    ville?: string
    pays?: string
  }
  lignes: LignePDF[]
  tva: number
  modePaiement: string
  sousTotalFormate: string
  montantTvaFormate: string
  totalTTCFormate: string
  totalEnLettres: string
}

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: "Helvetica", color: "#333" },
  header: { marginBottom: 20, display: "flex", flexDirection: "row", justifyContent: "space-between" },
  title: { fontSize: 22, fontWeight: "bold", color: "#1d4ed8" },
  section: { marginBottom: 15 },
  row: { display: "flex", flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#eee", paddingVertical: 6 },
  th: { backgroundColor: "#f8fafc", fontWeight: "bold" },
  cell: { flex: 1, paddingHorizontal: 4 },
  cellRight: { textAlign: "right" },
  totauxContainer: { marginTop: 15, alignSelf: "flex-end", width: 200 },
  totalRow: { display: "flex", flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  bold: { fontWeight: "bold" },
  lettres: { marginTop: 15, fontSize: 9, fontStyle: "italic", color: "#666" }
})

export default function FacturePDF({
  numeroFacture,
  dateFacture,
  dateEcheance,
  client,
  vendeur,
  lignes,
  tva,
  modePaiement,
  sousTotalFormate,
  montantTvaFormate,
  totalTTCFormate,
  totalEnLettres
}: FacturePDFProps) {
  
  // Fonction de secours locale au cas où une valeur brute non-formatée passerait
  const safeGetMontant = (formate?: string, brut?: number) => {
    if (formate) return formate
    if (brut !== undefined) return Math.floor(brut).toLocaleString("de-DE")
    return "0"
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Entête */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>FACTURE</Text>
            <Text>N° {numeroFacture}</Text>
          </View>
          <View style={{ alignItems: "right" }}>
            <Text style={styles.bold}>{vendeur.raisonSociale || vendeur.nom}</Text>
            <Text>{vendeur.adresse} {vendeur.ville}</Text>
            <Text>{vendeur.telephone}</Text>
          </View>
        </View>

        {/* Infos Client & Facture */}
        <View style={[styles.header, { marginTop: 10 }]}>
          <View>
            <Text style={styles.bold}>Facturé à :</Text>
            <Text>{client.nom}</Text>
            <Text>{client.adresse}</Text>
            <Text>{client.telephone}</Text>
          </View>
          <View style={{ alignItems: "right" }}>
            <Text>Date de facturation : {dateFacture}</Text>
            <Text>Date d'échéance : {dateEcheance}</Text>
            <Text>Mode de règlement : {modePaiement}</Text>
          </View>
        </View>

        {/* Tableau des articles */}
        <View style={{ marginTop: 20 }}>
          <View style={[styles.row, styles.th]}>
            <Text style={[styles.cell, styles.bold]}>Désignation</Text>
            <Text style={[styles.cell, styles.bold, { textAlign: "center" }]}>Qté</Text>
            <Text style={[styles.cell, styles.bold, styles.cellRight]}>Prix unitaire</Text>
            <Text style={[styles.cell, styles.bold, styles.cellRight]}>Total Brut</Text>
          </View>

          {lignes.map((ligne, index) => (
            <View key={index} style={styles.row}>
              <Text style={[styles.cell, { flex: 2 }]}>{ligne.designation || "Article sans nom"}</Text>
              <Text style={[styles.cell, { textAlign: "center" }]}>{ligne.quantite}</Text>
              <Text style={[styles.cell, styles.cellRight]}>
                {safeGetMontant(ligne.prixUnitaireFormate, ligne.prixUnitaire)} FCFA
              </Text>
              <Text style={[styles.cell, styles.cellRight]}>
                {safeGetMontant(ligne.totalFormate, ligne.total)} FCFA
              </Text>
            </View>
          ))}
        </View>

        {/* Bloc Financement Totaux */}
        <View style={styles.totauxContainer}>
          <View style={styles.totalRow}>
            <Text>Net Commercial (HT) :</Text>
            <Text style={styles.bold}>{sousTotalFormate} FCFA</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>TVA ({tva}%) :</Text>
            <Text style={styles.bold}>{montantTvaFormate} FCFA</Text>
          </View>
          <View style={[styles.totalRow, { borderTopWidth: 1, borderTopColor: "#333", paddingTop: 4 }]}>
            <Text style={styles.bold}>NET À PAYER :</Text>
            <Text style={[styles.bold, { color: "#1d4ed8" }]}>{totalTTCFormate} FCFA</Text>
          </View>
        </View>

        {/* Arrêté en lettres */}
        <Text style={styles.lettres}>
          Arrêtée la présente facture à la somme de : {totalEnLettres}
        </Text>
      </Page>
    </Document>
  )
}