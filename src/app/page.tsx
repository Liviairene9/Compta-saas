import { Euro, CreditCard, Landmark, Book, FileChartColumnIncreasing, TrendingUp, Users, BellRing, Shield , MoveRight } from "lucide-react"
import Link from "next/link"
const icons = [
  { Icon: Euro,  delay: "0s"                   , angle: 0   },
  { Icon: CreditCard,  delay: "0.2s",             angle: 45  },
  { Icon: Landmark,    delay: "0.4s",             angle: 90  },
  { Icon: FileChartColumnIncreasing, delay: "0.6s", angle: 135 },
  { Icon: TrendingUp,  delay: "0.8s",             angle: 180 },
  { Icon: Users,  delay: "1s",                    angle: 225 },
  { Icon: BellRing,  delay: "1.2s",                angle: 270 },
  { Icon: Shield,  delay: "1.4s",                  angle: 315 },
]

const RADIUS = 140  


export default function homepage () {
    return(
      <div className='h-screen w-full flex flex-col'>
                  <nav className=" flex fixed md:fixed  justify-between items-center p-6  max-w-7xl mx-auto w-full ">
                     <h1 className="text-2xl  font-bold text-blue-700 mr-4">Compta SaaS</h1>
                    <div className=" md:flex space-x-1 flex-1 justify-center items-center gap-8">
                    <Link href="/" className="hover:text-gray-200 font-bold">Home</Link>
                                <Link href="/#fonctionnalités" className="hover:text-gray-200">Fonctionnalités</Link>
          <Link href="/pricing" className="hover:text-gray-200 ">Pricing</Link>
          </div>
               <Link href="/auth" className="px-2 py-2 bg-blue-700 text-white rounded-xl ml-2" type="submit">Connexion</Link>
                  </nav>
        
        <div className="min-h-screen flex  items-center bg-slate-50 ">
          <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between px-6 py-12 gap-16">
       { /* Animation  des  icones en orbite */ }
        <div className="flex-1 flex justify-center items-center">
          <div className="relative" style={{ width: RADIUS * 2, height: RADIUS * 2 }}>
            <div className="absolute inset-0" style={{ animation: "orbit 20s linear infinite" }}>
              {icons.map(({ Icon, angle }, index) => {
                const rad = (angle * Math.PI) / 180;
                const x = RADIUS + RADIUS * Math.cos(rad) - 20;
                const y = RADIUS + RADIUS * Math.sin(rad) - 20;
                return (
                  <div key={index} className="absolute" style={{ left: x, top: y }}>
                    <Icon
                      size={40}
                      className="text-blue-600"
                      style={{ animation: "counter-orbit 20s linear infinite" }}
                    />
                  </div>
                );
              })}
            </div>
            {/* Logo central compta */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-blue-700 rounded-full w-24 h-24 flex items-center justify-center shadow-xl">
                <span className="text-white text-sm font-bold tracking-widest">COMPTA</span>
              </div>
            </div>
          </div>
        </div>
       {/* Flex de texte et bouton */}
        <div className="flex-1 flex flex-col space-y-6 text-center lg:text-left items-center lg:items-start">
          <h2 className="text-blue-700 text-4xl lg:text-6xl font-extrabold leading-tight">
            Gagnez du temps,  simplifiez votre comptabilité
          </h2>
          
          <p className="text-gray-600 text-lg lg:text-xl max-w-xl">
            Optimisez votre processus comptable et gagnez du temps pour manager 
            vos revenus, génération de factures, suivi hebdomadaire et rappels de paiement. 
            Tout ça sur une place !
          </p>

          <Link href="/auth" 
            className="flex items-center justify-center gap-3 px-8 py-4 bg-blue-700 text-white rounded-2xl text-xl font-bold hover:bg-blue-800 transition-transform hover:scale-105 shadow-xl group">
            Commencer 
            <MoveRight size={24} className="group-hover:translate-x-2 transition-transform"/>
          </Link>
        </div>
        
      </div>
           </div>
           {/* Section des fonctionnalités */}
                 <div id="fonctionnalités" className="min-h-screen p-8  flex flex-col bg-slate-50 space-y-5">
        <h1 className="text-3xl font-bold  text-blue-700 p-6 text-center">Fonctionnalités du système</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 justify-center">
          <div className="flex flex-col rounded-xl bg-white shadow-xl gap-4 p-4 px-2 py-2 ">
            <div className="flex gap-2">
            <Book className="text-blue-700" size={40} />
            <h1 className="text-xl font-bold text-blue-700">Génération des documents comptables</h1>
            </div>
            <p className="text-xl tracking-wide"> tels que les devis , 
               bons de commande ,bordereau de livraison , factures et enregistrement clients pour faciliter le remplissage des documents</p>
          </div>
                    <div className="flex flex-col rounded-2xl bg-white shadow-xl gap-4 p-4 px-2 py-2 ">
                       <div className="flex gap-2">

                      <TrendingUp className="text-blue-700" size={40} />
            <h2 className="text-xl font-bold text-blue-700">Visualisation des recettes</h2>
            </div>
            <p className="text-xl tracking-wide">Vue sur les recettes générés sur un dashboard et suivi en temps réel des factures payées </p>
          </div>
          <div className="flex flex-col rounded-2xl bg-white shadow-xl gap-4 p-4 px-2 py-2 ">
            <div className="flex gap-2">
            <FileChartColumnIncreasing className="text-blue-700" size={40} />
            <h2 className="text-xl font-bold text-blue-700">Rapports sur les documents générés</h2>
            </div>
            <p className="text-xl tracking-wide">Génération détaillée des rapports sur le documents comptables générés en une période temps précise</p>
          </div>
          <div className="flex flex-col rounded-2xl bg-white shadow-xl gap-4 p-4 px-2 py-2 ">
            <div className="flex gap-2">
            <BellRing className="text-blue-700"  size={40}/>
            <h2 className="text-xl font-bold text-blue-700"> Rappels aux clients </h2>
            </div>
            <p className="text-xl tracking-wide">Notifications aux clients en cas d'impayés ou acomptes restants </p>
          </div>

        </div>
      </div>

           </div>
)
}