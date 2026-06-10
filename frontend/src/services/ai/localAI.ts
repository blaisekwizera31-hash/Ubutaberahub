/**
 * Local AI - Comprehensive Rwandan Law Knowledge Base
 * No API needed! Complete legal information for Rwanda
 */

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface CaseClassification {
  category: string;
  priority: string;
  confidence: number;
  reasoning: string;
}

export interface DocumentAnalysisResult {
  summary: string;
  keyPoints: string[];
  parties: string[];
  dates: string[];
  suggestedCategory: string;
  suggestedPriority: string;
  legalIssues: string[];
}

// Comprehensive Legal Knowledge Base for Rwanda
const LEGAL_RESPONSES = {
  arrest: {
    en: `If you are arrested in Rwanda, you have several fundamental rights protected by the Constitution:

1. **Right to be informed** - You must be told the reasons for your arrest immediately in a language you understand.

2. **Right to remain silent** - You cannot be forced to make statements that may be used against you.

3. **Right to legal counsel** - You can request an attorney. If you cannot afford one, the state may provide legal aid.

4. **Right to humane treatment** - You must be treated with dignity and cannot be subjected to torture or cruel treatment.

5. **Right to appear before a judge** - You must be brought before a judge within 72 hours of arrest.

6. **Right to inform family** - You have the right to inform your family or someone of your choice about your arrest.

Remember: These are general rights. For specific legal advice about your situation, consult a licensed attorney.`,
    rw: `Niba ufatwa mu Rwanda, ufite uburenganzira bwinshi burindwa n'Itegeko Nshinga:

1. **Uburenganzira bwo kumenyeshwa** - Ugomba kubwirwa impamvu yo gufatwa ako kanya mu rurimi usobanukiramo.

2. **Uburenganzira bwo guceceka** - Ntushobora guhatirwa gutanga ubuhamya bushobora gukoreshwa mu kuguhana.

3. **Uburenganzira bwo kubona umwunganizi w'amategeko** - Ushobora gusaba umwunganizi. Niba udafite uburyo bwo kumwishyura, leta ishobora kukuha ubufasha.

4. **Uburenganzira bwo gufatwa neza** - Ugomba gufatwa mu cyubahiro kandi ntushobora gukorerwa iyicarubozo cyangwa imibabaro.

5. **Uburenganzira bwo kujya imbere y'umucamanza** - Ugomba kuzanwa imbere y'umucamanza mu masaha 72 uhereye igihe wafatiwe.

Wibuke: Ibi ni uburenganzira rusange. Ku nama y'amategeko ihariye ku bibazo byawe, baza umwunganizi w'amategeko wemewe.`,
    fr: `Si vous êtes arrêté au Rwanda, vous avez plusieurs droits fondamentaux protégés par la Constitution:

1. **Droit d'être informé** - On doit vous dire immédiatement les raisons de votre arrestation dans une langue que vous comprenez.

2. **Droit de garder le silence** - Vous ne pouvez pas être forcé de faire des déclarations qui pourraient être utilisées contre vous.

3. **Droit à un avocat** - Vous pouvez demander un avocat. Si vous ne pouvez pas en payer un, l'État peut fournir une aide juridique.

4. **Droit à un traitement humain** - Vous devez être traité avec dignité et ne pouvez pas être soumis à la torture.

5. **Droit de comparaître devant un juge** - Vous devez être présenté devant un juge dans les 72 heures suivant l'arrestation.

Rappelez-vous: Ce sont des droits généraux. Pour des conseils juridiques spécifiques, consultez un avocat agréé.`
  },
  property: {
    en: `For property disputes in Rwanda:

**Overview**: Property disputes involve conflicts over land ownership, boundaries, or usage rights.

**Common Steps**:
1. Gather all property documents (land titles, purchase agreements)
2. Try mediation with local authorities (Abunzi)
3. If unresolved, file a case with the court
4. Present evidence and witnesses

**Important Rights**:
- Right to own property
- Right to fair compensation if property is taken
- Right to legal representation

**Documents Needed**:
- Land title or ownership proof
- Survey documents
- Purchase agreements
- Witness statements

**When to Seek Legal Counsel**: Immediately if the dispute involves significant value or if mediation fails.`,
    rw: `Ku mpaka z'imitungo mu Rwanda:

**Incamake**: Impaka z'imitungo zireba amakimbirane ku butaka, imipaka, cyangwa uburenganzira bwo gukoresha.

**Intambwe zisanzwe**:
1. Kusanya inyandiko zose z'umutungo (ibyangombwa by'ubutaka)
2. Kugerageza ubwumvikane hamwe n'abayobozi b'ibanze (Abunzi)
3. Niba bidakemutse, utange urubanza mu rukiko
4. Tanga ibimenyetso n'abatangabuhamya

**Inyandiko zikenewe**:
- Icyangombwa cy'ubutaka
- Inyandiko z'ipimwa
- Amasezerano yo kugura
- Ubuhamya bw'abatangabuhamya`,
    fr: `Pour les litiges fonciers au Rwanda:

**Aperçu**: Les litiges fonciers concernent les conflits sur la propriété, les limites ou les droits d'usage.

**Étapes communes**:
1. Rassembler tous les documents de propriété
2. Essayer la médiation avec les autorités locales (Abunzi)
3. Si non résolu, déposer une plainte au tribunal
4. Présenter des preuves et des témoins

**Documents nécessaires**:
- Titre foncier
- Documents d'arpentage
- Accords d'achat
- Déclarations de témoins`
  },
  employment: {
    en: `For employment law issues in Rwanda:

**Overview**: Employment law covers contracts, termination, wages, and workplace rights.

**Your Rights**:
- Right to a written employment contract
- Right to fair wages and timely payment
- Right to safe working conditions
- Protection against unfair dismissal
- Right to notice before termination

**Common Issues**:
- Wrongful termination
- Unpaid wages
- Contract disputes
- Workplace discrimination

**Steps to Take**:
1. Review your employment contract
2. Document all issues (dates, witnesses, evidence)
3. Try to resolve with employer first
4. Contact labor inspector if unresolved
5. Consider legal action if necessary

**Documents Needed**:
- Employment contract
- Pay slips
- Termination letter (if applicable)
- Any written communications

Consult a labor law attorney for specific advice.`,
    rw: `Ku bibazo by'amategeko y'akazi mu Rwanda:

**Incamake**: Amategeko y'akazi areba amasezerano, guhagarikwa, imishahara, n'uburenganzira ku kazi.

**Uburenganzira bwawe**:
- Uburenganzira bwo kugira amasezerano y'akazi yanditse
- Uburenganzira bwo kwishyurwa neza no ku gihe
- Uburenganzira bwo gukorera mu mibereho myiza
- Kurindwa guhagarikwa ku buryo butari bwo

**Intambwe zo gufata**:
1. Suzuma amasezerano yawe y'akazi
2. Andika ibibazo byose
3. Gerageza gukemura n'umukoresha
4. Vugana n'umugenzuzi w'akazi niba bidakemutse`,
    fr: `Pour les questions de droit du travail au Rwanda:

**Aperçu**: Le droit du travail couvre les contrats, les licenciements, les salaires et les droits au travail.

**Vos droits**:
- Droit à un contrat de travail écrit
- Droit à un salaire équitable
- Droit à des conditions de travail sûres
- Protection contre le licenciement abusif

**Étapes à suivre**:
1. Examiner votre contrat de travail
2. Documenter tous les problèmes
3. Essayer de résoudre avec l'employeur
4. Contacter l'inspecteur du travail`
  },
  family: {
    en: `For family law matters in Rwanda:

**Common Issues**:
- Marriage and divorce
- Child custody and support
- Inheritance and succession
- Domestic violence protection

**Marriage**:
- Legal marriage age: 21 years
- Both parties must consent
- Registration required

**Divorce**:
- Must be filed in court
- Grounds include: adultery, abandonment, cruelty
- Property division according to matrimonial regime

**Child Custody**:
- Best interest of the child is primary consideration
- Both parents have rights and responsibilities
- Court decides custody arrangements

**Documents Typically Needed**:
- Marriage certificate
- Birth certificates of children
- Property documents
- Evidence supporting your case

Seek legal counsel for family law matters as they can be complex.`,
    rw: `Ku bibazo by'amategeko y'umuryango mu Rwanda:

**Ibibazo bisanzwe**:
- Ubukwe n'ingaruka
- Kurerea abana n'ubufasha
- Umurage
- Kurinda ihohoterwa rikorerwa mu muryango

**Ubukwe**:
- Imyaka yo gushyingiranwa: 21
- Abombi bagomba kwemera
- Kwandikisha birakenewe

**Ingaruka**:
- Zigomba gutangwa mu rukiko
- Impamvu zirimo: ubusambanyi, guterwa, ubugome

**Kurerea abana**:
- Inyungu z'umwana ni yo mbere
- Ababyeyi bombi bafite uburenganzira n'inshingano`,
    fr: `Pour les questions de droit de la famille au Rwanda:

**Questions courantes**:
- Mariage et divorce
- Garde et pension alimentaire des enfants
- Héritage et succession
- Protection contre la violence domestique

**Mariage**:
- Âge légal du mariage: 21 ans
- Consentement des deux parties requis
- Enregistrement obligatoire

**Divorce**:
- Doit être déposé au tribunal
- Motifs: adultère, abandon, cruauté

**Garde des enfants**:
- L'intérêt supérieur de l'enfant est primordial
- Les deux parents ont des droits`
  },
  general: {
    en: `I'm here to help you understand your legal rights and options in Rwanda. I can provide general guidance on:

- Criminal law and your rights if arrested
- Property and land disputes
- Employment law issues
- Family law matters
- Contract disputes
- Business law questions

Please note: I provide general legal information, not specific legal advice. For your particular situation, please consult with a licensed attorney.

What legal question can I help you with today?`,
    rw: `Ndi hano kugirango nkufashe gusobanukirwa uburenganzira bwawe n'amahitamo mu Rwanda. Nshobora gutanga ubuyobozi rusange kuri:

- Amategeko y'ibyaha n'uburenganzira bwawe iyo ufatwa
- Impaka z'imitungo n'ubutaka
- Ibibazo by'amategeko y'akazi
- Ibibazo by'amategeko y'umuryango
- Impaka ku masezerano
- Ibibazo by'amategeko y'ubucuruzi

Menya: Ntanga inama z'amategeko zihariye. Ku bibazo byawe by'umwihariko, baza umwunganizi w'amategeko wemewe.

Ni ikihe kibazo cy'amategeko nshobora kugufashamo uyu munsi?`,
    fr: `Je suis là pour vous aider à comprendre vos droits et options juridiques au Rwanda. Je peux fournir des conseils généraux sur:

- Le droit pénal et vos droits en cas d'arrestation
- Les litiges fonciers et immobiliers
- Les questions de droit du travail
- Les questions de droit de la famille
- Les litiges contractuels
- Les questions de droit des affaires

Note: Je fournis des informations juridiques générales, pas des conseils juridiques spécifiques. Pour votre situation particulière, consultez un avocat agréé.

Quelle question juridique puis-je vous aider aujourd'hui?`
  }
};

// Case classification rules
const CASE_CATEGORIES = {
  'family law': ['marriage', 'divorce', 'custody', 'child', 'spouse', 'inheritance', 'succession', 'domestic'],
  'property dispute': ['property', 'land', 'boundary', 'title', 'ownership', 'fence', 'neighbor', 'plot'],
  'criminal defense': ['arrest', 'police', 'crime', 'theft', 'assault', 'criminal', 'charge', 'accused'],
  'employment law': ['employment', 'job', 'fired', 'termination', 'salary', 'wage', 'contract', 'employer', 'workplace'],
  'contract dispute': ['contract', 'agreement', 'breach', 'payment', 'debt', 'loan', 'business deal'],
  'business law': ['business', 'company', 'partnership', 'registration', 'license', 'tax', 'commercial']
};

/**
 * Chat with local AI
 */
export async function chatWithAI(
  messages: ChatMessage[],
  language: 'en' | 'rw' | 'fr' = 'en'
): Promise<string> {
  // Get the last user message
  const lastMessage = messages.filter(m => m.role === 'user').pop();
  if (!lastMessage) {
    return LEGAL_RESPONSES.general[language];
  }

  const query = lastMessage.content.toLowerCase();

  // Check for keywords and return appropriate response
  if (query.includes('arrest') || query.includes('police') || query.includes('rights')) {
    return LEGAL_RESPONSES.arrest[language];
  }

  if (query.includes('property') || query.includes('land') || query.includes('boundary')) {
    return LEGAL_RESPONSES.property[language];
  }

  if (query.includes('employment') || query.includes('job') || query.includes('fired') || query.includes('work')) {
    return LEGAL_RESPONSES.employment[language];
  }

  if (query.includes('family') || query.includes('marriage') || query.includes('divorce') || query.includes('child')) {
    return LEGAL_RESPONSES.family[language];
  }

  // Default response
  return LEGAL_RESPONSES.general[language];
}

/**
 * Classify case based on description
 */
export async function classifyCase(
  title: string,
  description: string
): Promise<CaseClassification> {
  const text = `${title} ${description}`.toLowerCase();
  
  let bestMatch = 'Other';
  let maxScore = 0;

  // Score each category
  for (const [category, keywords] of Object.entries(CASE_CATEGORIES)) {
    let score = 0;
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        score++;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestMatch = category.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
  }

  // Determine priority
  const urgentWords = ['urgent', 'emergency', 'immediate', 'asap', 'quickly', 'now'];
  const priority = urgentWords.some(word => text.includes(word)) ? 'high' : 'medium';

  return {
    category: bestMatch,
    priority: priority,
    confidence: maxScore > 0 ? Math.min(0.9, 0.5 + (maxScore * 0.1)) : 0.5,
    reasoning: `Based on keywords found in the description, this appears to be a ${bestMatch} case with ${priority} priority.`
  };
}

/**
 * Analyze document
 */
export async function analyzeDocument(
  documentText: string,
  fileName: string
): Promise<DocumentAnalysisResult> {
  const text = documentText.toLowerCase();
  
  // Extract potential parties (names in caps or after "between")
  const parties: string[] = [];
  const partyMatches = documentText.match(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g);
  if (partyMatches) {
    parties.push(...partyMatches.slice(0, 3));
  }

  // Extract dates
  const dates: string[] = [];
  const dateMatches = documentText.match(/\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/g);
  if (dateMatches) {
    dates.push(...dateMatches.slice(0, 3));
  }

  // Determine category
  let category = 'Other';
  for (const [cat, keywords] of Object.entries(CASE_CATEGORIES)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      category = cat.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      break;
    }
  }

  return {
    summary: `Document "${fileName}" appears to be related to ${category}. Contains ${documentText.length} characters of text.`,
    keyPoints: [
      'Document has been uploaded and analyzed',
      `Identified as ${category} related`,
      parties.length > 0 ? `Parties mentioned: ${parties.join(', ')}` : 'No specific parties identified'
    ],
    parties: parties,
    dates: dates,
    suggestedCategory: category,
    suggestedPriority: 'medium',
    legalIssues: [`${category} matter requiring legal review`]
  };
}

/**
 * Generate legal guidance
 */
export async function generateLegalGuidance(
  caseType: string,
  language: 'en' | 'rw' | 'fr' = 'en'
): Promise<string> {
  const type = caseType.toLowerCase();
  
  if (type.includes('property')) {
    return LEGAL_RESPONSES.property[language];
  } else if (type.includes('employment')) {
    return LEGAL_RESPONSES.employment[language];
  } else if (type.includes('family')) {
    return LEGAL_RESPONSES.family[language];
  } else if (type.includes('criminal')) {
    return LEGAL_RESPONSES.arrest[language];
  }
  
  return LEGAL_RESPONSES.general[language];
}

/**
 * Find similar cases
 */
export async function findSimilarCases(
  caseDescription: string,
  existingCases: Array<{ id: string; title: string; description: string; type: string }>
): Promise<Array<{ id: string; similarity: number; reasoning: string }>> {
  const query = caseDescription.toLowerCase();
  const results: Array<{ id: string; similarity: number; reasoning: string }> = [];

  for (const existingCase of existingCases) {
    const caseText = `${existingCase.title} ${existingCase.description}`.toLowerCase();
    
    // Simple keyword matching
    const queryWords = query.split(' ').filter(w => w.length > 3);
    let matches = 0;
    
    for (const word of queryWords) {
      if (caseText.includes(word)) {
        matches++;
      }
    }
    
    const similarity = Math.min(0.95, matches / queryWords.length);
    
    if (similarity > 0.3) {
      results.push({
        id: existingCase.id,
        similarity: similarity,
        reasoning: `Similar ${existingCase.type} case with matching keywords`
      });
    }
  }

  return results.sort((a, b) => b.similarity - a.similarity).slice(0, 3);
}

/**
 * Summarize text
 */
export async function summarizeText(
  text: string,
  maxLength: number = 200
): Promise<string> {
  // Simple summarization: take first sentences up to maxLength
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  let summary = '';
  
  for (const sentence of sentences) {
    if ((summary + sentence).length <= maxLength) {
      summary += sentence;
    } else {
      break;
    }
  }
  
  return summary.trim() || text.substring(0, maxLength) + '...';
}
