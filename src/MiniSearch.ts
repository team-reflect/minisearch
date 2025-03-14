import SearchableMap from './SearchableMap/SearchableMap'

const OR = 'or'
const AND = 'and'
const AND_NOT = 'and_not'

/**
 * Search options to customize the search behavior.
 */
export type SearchOptions = {
  /**
   * Names of the fields to search in. If omitted, all fields are searched.
   */
  fields?: string[],

  /**
   * Function used to filter search results, for example on the basis of stored
   * fields. It takes as argument each search result and should return a boolean
   * to indicate if the result should be kept or not.
   */
  filter?: (result: SearchResult) => boolean,

  /**
   * Key-value object of field names to boosting values. By default, fields are
   * assigned a boosting factor of 1. If one assigns to a field a boosting value
   * of 2, a result that matches the query in that field is assigned a score
   * twice as high as a result matching the query in another field, all else
   * being equal.
   */
  boost?: { [fieldName: string]: number },

  /**
   * Relative weights to assign to prefix search results and fuzzy search
   * results. Exact matches are assigned a weight of 1.
   */
  weights?: { fuzzy: number, prefix: number },

  /**
   * Function to calculate a boost factor for documents. It takes as arguments
   * the document ID, and a term that matches the search in that document, and
   * should return a boosting factor.
   */
  boostDocument?: (documentId: any, term: string) => number,

  /**
   * Controls whether to perform prefix search. It can be a simple boolean, or a
   * function.
   *
   * If a boolean is passed, prefix search is performed if true.
   *
   * If a function is passed, it is called upon search with a search term, the
   * positional index of that search term in the tokenized search query, and the
   * tokenized search query. The function should return a boolean to indicate
   * whether to perform prefix search for that search term.
   */
  prefix?: boolean | ((term: string, index: number, terms: string[]) => boolean),

  /**
   * Controls whether to perform fuzzy search. It can be a simple boolean, or a
   * number, or a function.
   *
   * If a boolean is given, fuzzy search with a default fuzziness parameter is
   * performed if true.
   *
   * If a number higher or equal to 1 is given, fuzzy search is performed, with
   * a maximum edit distance (Levenshtein) equal to the number.
   *
   * If a number between 0 and 1 is given, fuzzy search is performed within a
   * maximum edit distance corresponding to that fraction of the term length,
   * approximated to the nearest integer. For example, 0.2 would mean an edit
   * distance of 20% of the term length, so 1 character in a 5-characters term.
   * The calculated fuzziness value is limited by the `maxFuzzy` option, to
   * prevent slowdown for very long queries.
   *
   * If a function is passed, the function is called upon search with a search
   * term, a positional index of that term in the tokenized search query, and
   * the tokenized search query. It should return a boolean or a number, with
   * the meaning documented above.
   */
  fuzzy?: boolean | number | ((term: string, index: number, terms: string[]) => boolean | number),

  /**
   * Controls the maximum fuzziness when using a fractional fuzzy value. This is
   * set to 6 by default. Very high edit distances usually don't produce
   * meaningful results, but can excessively impact search performance.
   */
  maxFuzzy?: number,

  /**
   * The operand to combine partial results for each term. By default it is
   * "OR", so results matching _any_ of the search terms are returned by a
   * search. If "AND" is given, only results matching _all_ the search terms are
   * returned by a search.
   */
  combineWith?: string,

  /**
   * Function to tokenize the search query. By default, the same tokenizer used
   * for indexing is used also for search.
   */
  tokenize?: (text: string) => string[],

  /**
   * Function to process or normalize terms in the search query. By default, the
   * same term processor used for indexing is used also for search.
   */
  processTerm?: (term: string) => string | string[] | null | undefined | false
}

type SearchOptionsWithDefaults = SearchOptions & {
  boost: { [fieldName: string]: number },

  weights: { fuzzy: number, prefix: number },

  prefix: boolean | ((term: string, index: number, terms: string[]) => boolean),

  fuzzy: boolean | number | ((term: string, index: number, terms: string[]) => boolean | number),

  maxFuzzy: number,

  combineWith: string
}

/**
 * Configuration options passed to the [[MiniSearch]] constructor
 *
 * @typeParam T  The type of documents being indexed.
 */
export type Options<T = any> = {
   /**
    * Names of the document fields to be indexed.
    */
  fields: string[],

   /**
    * Name of the ID field, uniquely identifying a document.
    */
  idField?: string,

   /**
    * Names of fields to store, so that search results would include them. By
    * default none, so resuts would only contain the id field.
    */
  storeFields?: string[],

   /**
    * Function used to extract the value of each field in documents. By default,
    * the documents are assumed to be plain objects with field names as keys,
    * but by specifying a custom `extractField` function one can completely
    * customize how the fields are extracted.
    *
    * The function takes as arguments the document, and the name of the field to
    * extract from it. It should return the field value as a string.
    */
  extractField?: (document: T, fieldName: string) => string,

   /*
    * Function used to split a field value into individual terms to be indexed.
    * The default tokenizer separates terms by space or punctuation, but a
    * custom tokenizer can be provided for custom logic.
    *
    * The function takes as arguments string to tokenize, and the name of the
    * field it comes from. It should return the terms as an array of strings.
    * When used for tokenizing a search query instead of a document field, the
    * `fieldName` is undefined.
    */
  tokenize?: (text: string, fieldName?: string) => string[],

   /**
    * Function used to process a term before indexing or search. This can be
    * used for normalization (such as stemming). By default, terms are
    * downcased, and otherwise no other normalization is performed.
    *
    * The function takes as arguments a term to process, and the name of the
    * field it comes from. It should return the processed term as a string, or a
    * falsy value to reject the term entirely.
    *
    * It can also return an array of strings, in which case each string in the
    * returned array is indexed as a separate term.
    */
  processTerm?: (term: string, fieldName?: string) => string | string[] | null | undefined | false,

   /**
    * Default search options (see the [[SearchOptions]] type and the
    * [[MiniSearch.search]] method for details)
    */
  searchOptions?: SearchOptions,

   /**
    * Default auto suggest options (see the [[SearchOptions]] type and the
    * [[MiniSearch.autoSuggest]] method for details)
    */
  autoSuggestOptions?: SearchOptions
}

type OptionsWithDefaults<T = any> = Options<T> & {
  storeFields: string[],

  idField: string,

  extractField: (document: T, fieldName: string) => string,

  tokenize: (text: string, fieldName: string) => string[],

  processTerm: (term: string, fieldName: string) => string | string[] | null | undefined | false,

  searchOptions: SearchOptionsWithDefaults,

  autoSuggestOptions: SearchOptions
}

/**
 * The type of auto-suggestions
 */
export type Suggestion = {
  /**
   * The suggestion
   */
  suggestion: string,

  /**
   * Suggestion as an array of terms
   */
  terms: string[],

  /**
   * Score for the suggestion
   */
  score: number
}

/**
 * Match information for a search result. It is a key-value object where keys
 * are terms that matched, and values are the list of fields that the term was
 * found in.
 */
export type MatchInfo = {
  [term: string]: string[]
}

/**
 * Type of the search results. Each search result indicates the document ID, the
 * terms that matched, the match information, the score, and all the stored
 * fields.
 */
export type SearchResult = {
  /**
   * The document ID
   */
  id: any,

  /**
   * List of terms that matched
   */
  terms: string[],

  /**
   * Score of the search results
   */
  score: number,

  /**
   * Match information, see [[MatchInfo]]
   */
  match: MatchInfo,

  /**
   * Stored fields
   */
  [key: string]: any
}

/**
 * @ignore
 */
export type AsPlainObject = {
  documentCount: number,
  nextId: number,
  documentIds: { [shortId: string]: any }
  fieldIds: { [fieldName: string]: number }
  fieldLength: { [shortId: string]: number[] }
  averageFieldLength: number[],
  storedFields: { [shortId: string]: any }
  index: [string, { [fieldId: string]: SerializedIndexEntry }][]
  serializationVersion: number
}

export type QueryCombination = SearchOptions & { queries: Query[] }

/**
 * Search query expression, either a query string or an expression tree
 * combining several queries with a combination of AND or OR.
 */
export type Query = QueryCombination | string

type QuerySpec = {
  prefix: boolean,
  fuzzy: number | boolean,
  term: string
}

type DocumentTermFreqs = Map<number, number>
type FieldTermData = Map<number, DocumentTermFreqs>

interface RawResultValue {
  // Intermediate score, before applying the final score based on number of
  // matched terms.
  score: number,

  // Set of all query terms that were matched. They may not be present in the
  // text exactly in the case of prefix/fuzzy matches. We must check for
  // uniqueness before adding a new term. This is much fater than using a set,
  // because the number of elements is relatively small.
  terms: string[],

  // All terms that were found in the content, including the fields in which
  // they were present. This object will be provided as part of the final search
  // results.
  match: MatchInfo,
}

type RawResult = Map<number, RawResultValue>

/**
 * [[MiniSearch]] is the main entrypoint class, implementing a full-text search
 * engine in memory.
 *
 * @typeParam T  The type of the documents being indexed.
 *
 * ### Basic example:
 *
 * ```javascript
 * const documents = [
 *   {
 *     id: 1,
 *     title: 'Moby Dick',
 *     text: 'Call me Ishmael. Some years ago...',
 *     category: 'fiction'
 *   },
 *   {
 *     id: 2,
 *     title: 'Zen and the Art of Motorcycle Maintenance',
 *     text: 'I can see by my watch...',
 *     category: 'fiction'
 *   },
 *   {
 *     id: 3,
 *     title: 'Neuromancer',
 *     text: 'The sky above the port was...',
 *     category: 'fiction'
 *   },
 *   {
 *     id: 4,
 *     title: 'Zen and the Art of Archery',
 *     text: 'At first sight it must seem...',
 *     category: 'non-fiction'
 *   },
 *   // ...and more
 * ]
 *
 * // Create a search engine that indexes the 'title' and 'text' fields for
 * // full-text search. Search results will include 'title' and 'category' (plus the
 * // id field, that is always stored and returned)
 * const miniSearch = new MiniSearch({
 *   fields: ['title', 'text'],
 *   storeFields: ['title', 'category']
 * })
 *
 * // Add documents to the index
 * miniSearch.addAll(documents)
 *
 * // Search for documents:
 * let results = miniSearch.search('zen art motorcycle')
 * // => [
 * //   { id: 2, title: 'Zen and the Art of Motorcycle Maintenance', category: 'fiction', score: 2.77258 },
 * //   { id: 4, title: 'Zen and the Art of Archery', category: 'non-fiction', score: 1.38629 }
 * // ]
 * ```
 */
export default class MiniSearch<T = any> {
  protected _options: OptionsWithDefaults<T>
  protected _index: SearchableMap<FieldTermData>
  protected _documentCount: number
  protected _documentIds: Map<number, any>
  protected _fieldIds: { [key: string]: number }
  protected _fieldLength: Map<number, number[]>
  protected _avgFieldLength: number[]
  protected _nextId: number
  protected _storedFields: Map<number, Record<string, unknown>>

  /**
   * @param options  Configuration options
   *
   * ### Examples:
   *
   * ```javascript
   * // Create a search engine that indexes the 'title' and 'text' fields of your
   * // documents:
   * const miniSearch = new MiniSearch({ fields: ['title', 'text'] })
   * ```
   *
   * ### ID Field:
   *
   * ```javascript
   * // Your documents are assumed to include a unique 'id' field, but if you want
   * // to use a different field for document identification, you can set the
   * // 'idField' option:
   * const miniSearch = new MiniSearch({ idField: 'key', fields: ['title', 'text'] })
   * ```
   *
   * ### Options and defaults:
   *
   * ```javascript
   * // The full set of options (here with their default value) is:
   * const miniSearch = new MiniSearch({
   *   // idField: field that uniquely identifies a document
   *   idField: 'id',
   *
   *   // extractField: function used to get the value of a field in a document.
   *   // By default, it assumes the document is a flat object with field names as
   *   // property keys and field values as string property values, but custom logic
   *   // can be implemented by setting this option to a custom extractor function.
   *   extractField: (document, fieldName) => document[fieldName],
   *
   *   // tokenize: function used to split fields into individual terms. By
   *   // default, it is also used to tokenize search queries, unless a specific
   *   // `tokenize` search option is supplied. When tokenizing an indexed field,
   *   // the field name is passed as the second argument.
   *   tokenize: (string, _fieldName) => string.split(SPACE_OR_PUNCTUATION),
   *
   *   // processTerm: function used to process each tokenized term before
   *   // indexing. It can be used for stemming and normalization. Return a falsy
   *   // value in order to discard a term. By default, it is also used to process
   *   // search queries, unless a specific `processTerm` option is supplied as a
   *   // search option. When processing a term from a indexed field, the field
   *   // name is passed as the second argument.
   *   processTerm: (term, _fieldName) => term.toLowerCase(),
   *
   *   // searchOptions: default search options, see the `search` method for
   *   // details
   *   searchOptions: undefined,
   *
   *   // fields: document fields to be indexed. Mandatory, but not set by default
   *   fields: undefined
   *
   *   // storeFields: document fields to be stored and returned as part of the
   *   // search results.
   *   storeFields: []
   * })
   * ```
   */
  constructor (options: Options<T>) {
    if (options?.fields == null) {
      throw new Error('MiniSearch: option "fields" must be provided')
    }

    this._options = {
      ...defaultOptions,
      ...options,
      searchOptions: { ...defaultSearchOptions, ...(options.searchOptions || {}) },
      autoSuggestOptions: { ...defaultAutoSuggestOptions, ...(options.autoSuggestOptions || {}) }
    }

    this._index = new SearchableMap()

    this._documentCount = 0

    this._documentIds = new Map()

    // Fields are defined during initialization, don't change, are few in
    // number, rarely need iterating over, and have string keys. Therefore in
    // this case an object is a better candidate than a Map to store the mapping
    // from field key to ID.
    this._fieldIds = {}

    this._fieldLength = new Map()

    this._avgFieldLength = []

    this._nextId = 0

    this._storedFields = new Map()

    this.addFields(this._options.fields)
  }

  /**
   * Adds a document to the index
   *
   * @param document  The document to be indexed
   */
  add (document: T): void {
    const { extractField, tokenize, processTerm, fields, idField } = this._options
    const id = extractField(document, idField)
    if (id == null) {
      throw new Error(`MiniSearch: document does not have ID field "${idField}"`)
    }

    const shortDocumentId = this.addDocumentId(id)
    this.saveStoredFields(shortDocumentId, document)

    for (const field of fields) {
      const fieldValue = extractField(document, field)
      if (fieldValue == null) continue

      const tokens = tokenize(fieldValue.toString(), field)
      const fieldId = this._fieldIds[field]

      const uniqueTerms = new Set(tokens).size
      this.addFieldLength(shortDocumentId, fieldId, this._documentCount - 1, uniqueTerms)

      for (const term of tokens) {
        const processedTerm = processTerm(term, field)
        if (Array.isArray(processedTerm)) {
          for (const t of processedTerm) {
            this.addTerm(fieldId, shortDocumentId, t)
          }
        } else if (processedTerm) {
          this.addTerm(fieldId, shortDocumentId, processedTerm)
        }
      }
    }
  }

  /**
   * Adds all the given documents to the index
   *
   * @param documents  An array of documents to be indexed
   */
  addAll (documents: T[]): void {
    for (const document of documents) this.add(document)
  }

  /**
   * Adds all the given documents to the index asynchronously.
   *
   * Returns a promise that resolves (to `undefined`) when the indexing is done.
   * This method is useful when index many documents, to avoid blocking the main
   * thread. The indexing is performed asynchronously and in chunks.
   *
   * @param documents  An array of documents to be indexed
   * @param options  Configuration options
   * @return A promise resolving to `undefined` when the indexing is done
   */
  addAllAsync (documents: T[], options: { chunkSize?: number } = {}): Promise<void> {
    const { chunkSize = 10 } = options
    const acc: { chunk: T[], promise: Promise<void> } = { chunk: [], promise: Promise.resolve() }

    const { chunk, promise } = documents.reduce(({ chunk, promise }, document: T, i: number) => {
      chunk.push(document)
      if ((i + 1) % chunkSize === 0) {
        return {
          chunk: [],
          promise: promise
            .then(() => new Promise(resolve => setTimeout(resolve, 0)))
            .then(() => this.addAll(chunk))
        }
      } else {
        return { chunk, promise }
      }
    }, acc)

    return promise.then(() => this.addAll(chunk))
  }

  /**
   * Removes the given document from the index.
   *
   * The document to delete must NOT have changed between indexing and deletion,
   * otherwise the index will be corrupted. Therefore, when reindexing a document
   * after a change, the correct order of operations is:
   *
   *   1. remove old version
   *   2. apply changes
   *   3. index new version
   *
   * @param document  The document to be removed
   */
  remove (document: T): void {
    const { tokenize, processTerm, extractField, fields, idField } = this._options
    const id = extractField(document, idField)

    if (id == null) {
      throw new Error(`MiniSearch: document does not have ID field "${idField}"`)
    }

    for (const [shortId, longId] of this._documentIds) {
      if (id === longId) {
        for (const field of fields) {
          const fieldValue = extractField(document, field)
          if (fieldValue == null) continue

          const tokens = tokenize(fieldValue.toString(), field)
          const fieldId = this._fieldIds[field]

          const uniqueTerms = new Set(tokens).size
          this.removeFieldLength(shortId, fieldId, this._documentCount, uniqueTerms)

          for (const term of tokens) {
            const processedTerm = processTerm(term, field)
            if (Array.isArray(processedTerm)) {
              for (const t of processedTerm) {
                this.removeTerm(fieldId, shortId, t)
              }
            } else if (processedTerm) {
              this.removeTerm(fieldId, shortId, processedTerm)
            }
          }
        }

        this._storedFields.delete(shortId)
        this._documentIds.delete(shortId)
        this._fieldLength.delete(shortId)
        this._documentCount -= 1
        return
      }
    }

    throw new Error(`MiniSearch: cannot remove document with ID ${id}: it is not in the index`)
  }

  /**
   * Removes all the given documents from the index. If called with no arguments,
   * it removes _all_ documents from the index.
   *
   * @param documents  The documents to be removed. If this argument is omitted,
   * all documents are removed. Note that, for removing all documents, it is
   * more efficient to call this method with no arguments than to pass all
   * documents.
   */
  removeAll (documents?: T[]): void {
    if (documents) {
      for (const document of documents) this.remove(document)
    } else if (arguments.length > 0) {
      throw new Error('Expected documents to be present. Omit the argument to remove all documents.')
    } else {
      this._index = new SearchableMap()
      this._documentCount = 0
      this._documentIds = new Map()
      this._fieldLength = new Map()
      this._avgFieldLength = []
      this._storedFields = new Map()
      this._nextId = 0
    }
  }

  /**
   * Search for documents matching the given search query.
   *
   * The result is a list of scored document IDs matching the query, sorted by
   * descending score, and each including data about which terms were matched and
   * in which fields.
   *
   * ### Basic usage:
   *
   * ```javascript
   * // Search for "zen art motorcycle" with default options: terms have to match
   * // exactly, and individual terms are joined with OR
   * miniSearch.search('zen art motorcycle')
   * // => [ { id: 2, score: 2.77258, match: { ... } }, { id: 4, score: 1.38629, match: { ... } } ]
   * ```
   *
   * ### Restrict search to specific fields:
   *
   * ```javascript
   * // Search only in the 'title' field
   * miniSearch.search('zen', { fields: ['title'] })
   * ```
   *
   * ### Field boosting:
   *
   * ```javascript
   * // Boost a field
   * miniSearch.search('zen', { boost: { title: 2 } })
   * ```
   *
   * ### Prefix search:
   *
   * ```javascript
   * // Search for "moto" with prefix search (it will match documents
   * // containing terms that start with "moto" or "neuro")
   * miniSearch.search('moto neuro', { prefix: true })
   * ```
   *
   * ### Fuzzy search:
   *
   * ```javascript
   * // Search for "ismael" with fuzzy search (it will match documents containing
   * // terms similar to "ismael", with a maximum edit distance of 0.2 term.length
   * // (rounded to nearest integer)
   * miniSearch.search('ismael', { fuzzy: 0.2 })
   * ```
   *
   * ### Combining strategies:
   *
   * ```javascript
   * // Mix of exact match, prefix search, and fuzzy search
   * miniSearch.search('ismael mob', {
   *  prefix: true,
   *  fuzzy: 0.2
   * })
   * ```
   *
   * ### Advanced prefix and fuzzy search:
   *
   * ```javascript
   * // Perform fuzzy and prefix search depending on the search term. Here
   * // performing prefix and fuzzy search only on terms longer than 3 characters
   * miniSearch.search('ismael mob', {
   *  prefix: term => term.length > 3
   *  fuzzy: term => term.length > 3 ? 0.2 : null
   * })
   * ```
   *
   * ### Combine with AND:
   *
   * ```javascript
   * // Combine search terms with AND (to match only documents that contain both
   * // "motorcycle" and "art")
   * miniSearch.search('motorcycle art', { combineWith: 'AND' })
   * ```
   *
   * ### Combine with AND_NOT:
   *
   * There is also an AND_NOT combinator, that finds documents that match the
   * first term, but do not match any of the other terms. This combinator is
   * rarely useful with simple queries, and is meant to be used with advanced
   * query combinations (see later for more details).
   *
   * ### Filtering results:
   *
   * ```javascript
   * // Filter only results in the 'fiction' category (assuming that 'category'
   * // is a stored field)
   * miniSearch.search('motorcycle art', {
   *   filter: (result) => result.category === 'fiction'
   * })
   * ```
   *
   * ### Advanced combination of queries:
   *
   * It is possible to combine different subqueries with OR, AND, and AND_NOT,
   * and even with different search options, by passing a query expression
   * tree object as the first argument, instead of a string.
   *
   * ```javascript
   * // Search for documents that contain "zen" and ("motorcycle" or "archery")
   * miniSearch.search({
   *   combineWith: 'AND',
   *   queries: [
   *     'zen',
   *     {
   *       combineWith: 'OR',
   *       queries: ['motorcycle', 'archery']
   *     }
   *   ]
   * })
   *
   * // Search for documents that contain ("apple" or "pear") but not "juice" and
   * // not "tree"
   * miniSearch.search({
   *   combineWith: 'AND_NOT',
   *   queries: [
   *     {
   *       combineWith: 'OR',
   *       queries: ['apple', 'pear']
   *     },
   *     'juice',
   *     'tree'
   *   ]
   * })
   * ```
   *
   * Each node in the expression tree can be either a string, or an object that
   * supports all `SearchOptions` fields, plus a `queries` array field for
   * subqueries.
   *
   * Note that, while this can become complicated to do by hand for complex or
   * deeply nested queries, it provides a formalized expression tree API for
   * external libraries that implement a parser for custom query languages.
   *
   * @param query  Search query
   * @param options  Search options. Each option, if not given, defaults to the corresponding value of `searchOptions` given to the constructor, or to the library default.
   */
  search (query: Query, searchOptions: SearchOptions = {}): SearchResult[] {
    const combinedResults = this.executeQuery(query, searchOptions)

    const results = []

    for (const [docId, { score, terms, match }] of combinedResults) {
      // Final score takes into account the number of matching QUERY terms.
      // The end user will only receive the MATCHED terms.
      const quality = terms.length

      const result = {
        id: this._documentIds.get(docId),
        score: score * quality,
        terms: Object.keys(match),
        match
      }

      Object.assign(result, this._storedFields.get(docId))
      if (searchOptions.filter == null || searchOptions.filter(result)) {
        results.push(result)
      }
    }

    results.sort(byScore)
    return results
  }

  /**
   * Provide suggestions for the given search query
   *
   * The result is a list of suggested modified search queries, derived from the
   * given search query, each with a relevance score, sorted by descending score.
   *
   * By default, it uses the same options used for search, except that by
   * default it performs prefix search on the last term of the query, and
   * combine terms with `'AND'` (requiring all query terms to match). Custom
   * options can be passed as a second argument. Defaults can be changed upon
   * calling the `MiniSearch` constructor, by passing a `autoSuggestOptions`
   * option.
   *
   * ### Basic usage:
   *
   * ```javascript
   * // Get suggestions for 'neuro':
   * miniSearch.autoSuggest('neuro')
   * // => [ { suggestion: 'neuromancer', terms: [ 'neuromancer' ], score: 0.46240 } ]
   * ```
   *
   * ### Multiple words:
   *
   * ```javascript
   * // Get suggestions for 'zen ar':
   * miniSearch.autoSuggest('zen ar')
   * // => [
   * //  { suggestion: 'zen archery art', terms: [ 'zen', 'archery', 'art' ], score: 1.73332 },
   * //  { suggestion: 'zen art', terms: [ 'zen', 'art' ], score: 1.21313 }
   * // ]
   * ```
   *
   * ### Fuzzy suggestions:
   *
   * ```javascript
   * // Correct spelling mistakes using fuzzy search:
   * miniSearch.autoSuggest('neromancer', { fuzzy: 0.2 })
   * // => [ { suggestion: 'neuromancer', terms: [ 'neuromancer' ], score: 1.03998 } ]
   * ```
   *
   * ### Filtering:
   *
   * ```javascript
   * // Get suggestions for 'zen ar', but only within the 'fiction' category
   * // (assuming that 'category' is a stored field):
   * miniSearch.autoSuggest('zen ar', {
   *   filter: (result) => result.category === 'fiction'
   * })
   * // => [
   * //  { suggestion: 'zen archery art', terms: [ 'zen', 'archery', 'art' ], score: 1.73332 },
   * //  { suggestion: 'zen art', terms: [ 'zen', 'art' ], score: 1.21313 }
   * // ]
   * ```
   *
   * @param queryString  Query string to be expanded into suggestions
   * @param options  Search options. The supported options and default values
   * are the same as for the `search` method, except that by default prefix
   * search is performed on the last term in the query, and terms are combined
   * with `'AND'`.
   * @return  A sorted array of suggestions sorted by relevance score.
   */
  autoSuggest (queryString: string, options: SearchOptions = {}): Suggestion[] {
    options = { ...this._options.autoSuggestOptions, ...options }

    const suggestions: Map<string, Omit<Suggestion, 'suggestion'> & { count: number }> = new Map()

    for (const { score, terms } of this.search(queryString, options)) {
      const phrase = terms.join(' ')
      const suggestion = suggestions.get(phrase)
      if (suggestion != null) {
        suggestion.score += score
        suggestion.count += 1
      } else {
        suggestions.set(phrase, { score, terms, count: 1 })
      }
    }

    const results = []
    for (const [suggestion, { score, terms, count }] of suggestions) {
      results.push({ suggestion, terms, score: score / count })
    }

    results.sort(byScore)
    return results
  }

  /**
   * Number of documents in the index
   */
  get documentCount (): number {
    return this._documentCount
  }

  /**
   * Deserializes a JSON index (serialized with `JSON.stringify(miniSearch)`)
   * and instantiates a MiniSearch instance. It should be given the same options
   * originally used when serializing the index.
   *
   * ### Usage:
   *
   * ```javascript
   * // If the index was serialized with:
   * let miniSearch = new MiniSearch({ fields: ['title', 'text'] })
   * miniSearch.addAll(documents)
   *
   * const json = JSON.stringify(miniSearch)
   * // It can later be deserialized like this:
   * miniSearch = MiniSearch.loadJSON(json, { fields: ['title', 'text'] })
   * ```
   *
   * @param json  JSON-serialized index
   * @param options  configuration options, same as the constructor
   * @return An instance of MiniSearch deserialized from the given JSON.
   */
  static loadJSON<T = any> (json: string, options: Options<T>): MiniSearch<T> {
    if (options == null) {
      throw new Error('MiniSearch: loadJSON should be given the same options used when serializing the index')
    }
    return MiniSearch.loadJS(JSON.parse(json), options)
  }

  /**
   * Returns the default value of an option. It will throw an error if no option
   * with the given name exists.
   *
   * @param optionName  Name of the option
   * @return The default value of the given option
   *
   * ### Usage:
   *
   * ```javascript
   * // Get default tokenizer
   * MiniSearch.getDefault('tokenize')
   *
   * // Get default term processor
   * MiniSearch.getDefault('processTerm')
   *
   * // Unknown options will throw an error
   * MiniSearch.getDefault('notExisting')
   * // => throws 'MiniSearch: unknown option "notExisting"'
   * ```
   */
  static getDefault (optionName: string): any {
    if (defaultOptions.hasOwnProperty(optionName)) {
      return getOwnProperty(defaultOptions, optionName)
    } else {
      throw new Error(`MiniSearch: unknown option "${optionName}"`)
    }
  }

  /**
   * @ignore
   */
  static loadJS<T = any> (js: AsPlainObject, options: Options<T>): MiniSearch<T> {
    const miniSearch = new MiniSearch(options)
    miniSearch.loadJS(js)
    return miniSearch
  }

  /**
   * @ignore
   */
  loadJS (js: AsPlainObject) {
    const {
      index,
      documentCount,
      nextId,
      documentIds,
      fieldIds,
      fieldLength,
      averageFieldLength,
      storedFields,
      serializationVersion
    } = js
    if (serializationVersion !== 1 && serializationVersion !== 2) {
      throw new Error('MiniSearch: cannot deserialize an index created with an incompatible version')
    }

    this._documentCount = documentCount
    this._nextId = nextId
    this._documentIds = objectToNumericMap(documentIds)
    this._fieldIds = fieldIds
    this._fieldLength = objectToNumericMap(fieldLength)
    this._avgFieldLength = averageFieldLength
    this._storedFields = objectToNumericMap(storedFields)
    this._index = new SearchableMap()

    for (const [term, data] of index) {
      const dataMap = new Map() as FieldTermData

      for (const fieldId of Object.keys(data)) {
        let indexEntry = data[fieldId]

        // Version 1 used to nest the index entry inside a field called ds
        if (serializationVersion === 1) {
          indexEntry = indexEntry.ds as unknown as SerializedIndexEntry
        }

        dataMap.set(parseInt(fieldId, 10), objectToNumericMap(indexEntry) as DocumentTermFreqs)
      }

      this._index.set(term, dataMap)
    }
  }

  /**
   * @ignore
   */
  private executeQuery (query: Query, searchOptions: SearchOptions = {}): RawResult {
    if (typeof query !== 'string') {
      const options = { ...searchOptions, ...query, queries: undefined }
      const results = query.queries.map((subquery) => this.executeQuery(subquery, options))
      return this.combineResults(results, query.combineWith)
    }

    const { tokenize, processTerm, searchOptions: globalSearchOptions } = this._options
    const options = { tokenize, processTerm, ...globalSearchOptions, ...searchOptions }
    const { tokenize: searchTokenize, processTerm: searchProcessTerm } = options
    const terms = searchTokenize(query)
      .flatMap((term: string) => searchProcessTerm(term))
      .filter((term) => !!term) as string[]
    const queries: QuerySpec[] = terms.map(termToQuerySpec(options))
    const results = queries.map(query => this.executeQuerySpec(query, options))

    return this.combineResults(results, options.combineWith)
  }

  /**
   * @ignore
   */
  private executeQuerySpec (query: QuerySpec, searchOptions: SearchOptions): RawResult {
    const options: SearchOptionsWithDefaults = { ...this._options.searchOptions, ...searchOptions }

    const boosts = (options.fields || this._options.fields).reduce((boosts, field) =>
      ({ ...boosts, [field]: getOwnProperty(boosts, field) || 1 }), options.boost || {})

    const {
      boostDocument,
      weights,
      maxFuzzy
    } = options

    const { fuzzy: fuzzyWeight, prefix: prefixWeight } = { ...defaultSearchOptions.weights, ...weights }

    const data = this._index.get(query.term)
    const results = this.termResults(query.term, query.term, 1, data, boosts, boostDocument)

    let prefixMatches
    let fuzzyMatches

    if (query.prefix) {
      prefixMatches = this._index.atPrefix(query.term)
    }

    if (query.fuzzy) {
      const fuzzy = (query.fuzzy === true) ? 0.2 : query.fuzzy
      const maxDistance = fuzzy < 1 ? Math.min(maxFuzzy, Math.round(query.term.length * fuzzy)) : fuzzy
      if (maxDistance) fuzzyMatches = this._index.fuzzyGet(query.term, maxDistance)
    }

    if (prefixMatches) {
      for (const [term, data] of prefixMatches) {
        const distance = term.length - query.term.length
        if (!distance) { continue } // Skip exact match.

        // Delete the term from fuzzy results (if present) if it is also a
        // prefix result. This entry will always be scored as a prefix result.
        fuzzyMatches?.delete(term)

        // Weight gradually approaches 0 as distance goes to infinity, with the
        // weight for the hypothetical distance 0 being equal to prefixWeight.
        // The rate of change is much lower than that of fuzzy matches to
        // account for the fact that prefix matches stay more relevant than
        // fuzzy matches for longer distances.
        const weight = prefixWeight * term.length / (term.length + 0.3 * distance)
        this.termResults(query.term, term, weight, data, boosts, boostDocument, results)
      }
    }

    if (fuzzyMatches) {
      for (const term of fuzzyMatches.keys()) {
        const [data, distance] = fuzzyMatches.get(term)!
        if (!distance) { continue } // Skip exact match.

        // Weight gradually approaches 0 as distance goes to infinity, with the
        // weight for the hypothetical distance 0 being equal to fuzzyWeight.
        const weight = fuzzyWeight * term.length / (term.length + distance)
        this.termResults(query.term, term, weight, data, boosts, boostDocument, results)
      }
    }

    return results
  }

  /**
   * @ignore
   */
  private combineResults (results: RawResult[], combineWith = OR): RawResult {
    if (results.length === 0) { return new Map() }
    const operator = combineWith.toLowerCase()
    return results.reduce(combinators[operator]) || new Map()
  }

  /**
   * Allows serialization of the index to JSON, to possibly store it and later
   * deserialize it with `MiniSearch.loadJSON`.
   *
   * Normally one does not directly call this method, but rather call the
   * standard JavaScript `JSON.stringify()` passing the `MiniSearch` instance,
   * and JavaScript will internally call this method. Upon deserialization, one
   * must pass to `loadJSON` the same options used to create the original
   * instance that was serialized.
   *
   * ### Usage:
   *
   * ```javascript
   * // Serialize the index:
   * let miniSearch = new MiniSearch({ fields: ['title', 'text'] })
   * miniSearch.addAll(documents)
   * const json = JSON.stringify(miniSearch)
   *
   * // Later, to deserialize it:
   * miniSearch = MiniSearch.loadJSON(json, { fields: ['title', 'text'] })
   * ```
   *
   * @return A plain-object serializeable representation of the search index.
   */
  toJSON (): AsPlainObject {
    const index: [string, { [key: string]: SerializedIndexEntry }][] = []

    for (const [term, fieldIndex] of this._index) {
      const data: { [key: string]: SerializedIndexEntry } = {}

      for (const [fieldId, freqs] of fieldIndex) {
        data[fieldId] = Object.fromEntries(freqs)
      }

      index.push([term, data])
    }

    return {
      documentCount: this._documentCount,
      nextId: this._nextId,
      documentIds: Object.fromEntries(this._documentIds),
      fieldIds: this._fieldIds,
      fieldLength: Object.fromEntries(this._fieldLength),
      averageFieldLength: this._avgFieldLength,
      storedFields: Object.fromEntries(this._storedFields),
      index,
      serializationVersion: 2
    }
  }

  /**
   * @ignore
   */
  private termResults (
    sourceTerm: string,
    derivedTerm: string,
    termWeight: number,
    fieldTermData: FieldTermData | undefined,
    fieldBoosts: { [field: string]: number },
    boostDocumentFn: ((id: any, term: string) => number) | undefined,
    results: RawResult = new Map()
  ): RawResult {
    if (fieldTermData == null) return results

    for (const field of Object.keys(fieldBoosts)) {
      const fieldBoost = fieldBoosts[field]
      const fieldId = this._fieldIds[field]

      const fieldTermFreqs = fieldTermData.get(fieldId)
      if (fieldTermFreqs == null) continue

      const matchingFields = fieldTermFreqs.size
      const avgFieldLength = this._avgFieldLength[fieldId]

      for (const docId of fieldTermFreqs.keys()) {
        const docBoost = boostDocumentFn ? boostDocumentFn(this._documentIds.get(docId), derivedTerm) : 1
        if (!docBoost) continue

        const termFreq = fieldTermFreqs.get(docId)!
        const fieldLength = this._fieldLength.get(docId)![fieldId]

        // NOTE: The total number of fields is set to the number of documents
        // `this._documentCount`. It could also make sense to use the number of
        // documents where the current field is non-blank as a normalisation
        // factor. This will make a difference in scoring if the field is rarely
        // present. This is currently not supported, and may require further
        // analysis to see if it is a valid use case.
        const rawScore = calcBM25Score(termFreq, matchingFields, this._documentCount, fieldLength, avgFieldLength)
        const weightedScore = termWeight * fieldBoost * docBoost * rawScore

        const result = results.get(docId)
        if (result) {
          result.score += weightedScore
          assignUniqueTerm(result.terms, sourceTerm)
          const match = getOwnProperty(result.match, derivedTerm)
          if (match) {
            match.push(field)
          } else {
            result.match[derivedTerm] = [field]
          }
        } else {
          results.set(docId, {
            score: weightedScore,
            terms: [sourceTerm],
            match: { [derivedTerm]: [field] }
          })
        }
      }
    }

    return results
  }

  /**
   * @ignore
   */
  private addTerm (fieldId: number, documentId: number, term: string): void {
    const indexData = this._index.fetch(term, createMap)

    let fieldIndex = indexData.get(fieldId)
    if (fieldIndex == null) {
      fieldIndex = new Map()
      fieldIndex.set(documentId, 1)
      indexData.set(fieldId, fieldIndex)
    } else {
      const docs = fieldIndex.get(documentId)
      fieldIndex.set(documentId, (docs || 0) + 1)
    }
  }

  /**
   * @ignore
   */
  private removeTerm (fieldId: number, documentId: number, term: string): void {
    if (!this._index.has(term)) {
      this.warnDocumentChanged(documentId, fieldId, term)
      return
    }

    const indexData = this._index.fetch(term, createMap)

    const fieldIndex = indexData.get(fieldId)
    if (fieldIndex == null || fieldIndex.get(documentId) == null) {
      this.warnDocumentChanged(documentId, fieldId, term)
    } else if (fieldIndex.get(documentId)! <= 1) {
      if (fieldIndex.size <= 1) {
        indexData.delete(fieldId)
      } else {
        fieldIndex.delete(documentId)
      }
    } else {
      fieldIndex.set(documentId, fieldIndex.get(documentId)! - 1)
    }

    if (this._index.get(term)!.size === 0) {
      this._index.delete(term)
    }
  }

  /**
   * @ignore
   */
  private warnDocumentChanged (shortDocumentId: number, fieldId: number, term: string): void {
    if (console == null || console.warn == null) { return }
    for (const fieldName of Object.keys(this._fieldIds)) {
      if (this._fieldIds[fieldName] === fieldId) {
        console.warn(`MiniSearch: document with ID ${this._documentIds.get(shortDocumentId)} has changed before removal: term "${term}" was not present in field "${fieldName}". Removing a document after it has changed can corrupt the index!`)
        return
      }
    }
  }

  /**
   * @ignore
   */
  private addDocumentId (documentId: any): number {
    const shortDocumentId = this._nextId
    this._documentIds.set(shortDocumentId, documentId)
    this._documentCount += 1
    this._nextId += 1
    return shortDocumentId
  }

  /**
   * @ignore
   */
  private addFields (fields: string[]): void {
    for (let i = 0; i < fields.length; i++) {
      this._fieldIds[fields[i]] = i
    }
  }

  /**
   * @ignore
   */
  private addFieldLength (documentId: number, fieldId: number, count: number, length: number): void {
    let fieldLengths = this._fieldLength.get(documentId)
    if (fieldLengths == null) this._fieldLength.set(documentId, fieldLengths = [])
    fieldLengths[fieldId] = length

    const averageFieldLength = this._avgFieldLength[fieldId] || 0
    const totalFieldLength = (averageFieldLength * count) + length
    this._avgFieldLength[fieldId] = totalFieldLength / (count + 1)
  }

  /**
   * @ignore
   */
  private removeFieldLength (documentId: number, fieldId: number, count: number, length: number): void {
    const totalFieldLength = (this._avgFieldLength[fieldId] * count) - length
    this._avgFieldLength[fieldId] = totalFieldLength / (count - 1)
  }

  /**
   * @ignore
   */
  private saveStoredFields (documentId: number, doc: T): void {
    const { storeFields, extractField } = this._options
    if (storeFields == null || storeFields.length === 0) { return }

    let documentFields = this._storedFields.get(documentId)
    if (documentFields == null) this._storedFields.set(documentId, documentFields = {})

    for (const fieldName of storeFields) {
      const fieldValue = extractField(doc, fieldName)
      if (fieldValue !== undefined) documentFields[fieldName] = fieldValue
    }
  }
}

const getOwnProperty = (object: any, property: string) =>
  Object.prototype.hasOwnProperty.call(object, property) ? object[property] : undefined

type CombinatorFunction = (a: RawResult, b: RawResult) => RawResult

const combinators: { [kind: string]: CombinatorFunction } = {
  [OR]: (a: RawResult, b: RawResult) => {
    for (const docId of b.keys()) {
      const existing = a.get(docId)
      if (existing == null) {
        a.set(docId, b.get(docId)!)
      } else {
        const { score, terms, match } = b.get(docId)!
        existing.score = existing.score + score
        existing.match = Object.assign(existing.match, match)
        assignUniqueTerms(existing.terms, terms)
      }
    }

    return a
  },
  [AND]: (a: RawResult, b: RawResult) => {
    const combined = new Map()

    for (const docId of b.keys()) {
      const existing = a.get(docId)
      if (existing == null) continue

      const { score, terms, match } = b.get(docId)!
      assignUniqueTerms(existing.terms, terms)
      combined.set(docId, {
        score: existing.score + score,
        terms: existing.terms,
        match: Object.assign(existing.match, match)
      })
    }

    return combined
  },
  [AND_NOT]: (a: RawResult, b: RawResult) => {
    for (const docId of b.keys()) a.delete(docId)
    return a
  }
}

// https://en.wikipedia.org/wiki/Okapi_BM25
// https://opensourceconnections.com/blog/2015/10/16/bm25-the-next-generation-of-lucene-relevation/
const k = 1.2 // Term frequency saturation point. Recommended values are between 1.2 and 2.
const b = 0.7 // Length normalization impact. Recommended values are around 0.75.
const d = 0.5 // BM25+ frequency normalization lower bound. Recommended values are between 0.5 and 1.
const calcBM25Score = (
  termFreq: number,
  matchingCount: number,
  totalCount: number,
  fieldLength: number,
  avgFieldLength: number
): number => {
  const invDocFreq = Math.log(1 + (totalCount - matchingCount + 0.5) / (matchingCount + 0.5))
  return invDocFreq * (d + termFreq * (k + 1) / (termFreq + k * (1 - b + b * fieldLength / avgFieldLength)))
}

const termToQuerySpec = (options: SearchOptions) => (term: string, i: number, terms: string[]): QuerySpec => {
  const fuzzy = (typeof options.fuzzy === 'function')
    ? options.fuzzy(term, i, terms)
    : (options.fuzzy || false)
  const prefix = (typeof options.prefix === 'function')
    ? options.prefix(term, i, terms)
    : (options.prefix === true)
  return { term, fuzzy, prefix }
}

const defaultOptions = {
  idField: 'id',
  extractField: (document: { [key: string]: any }, fieldName: string) => document[fieldName],
  tokenize: (text: string, fieldName?: string) => text.split(SPACE_OR_PUNCTUATION),
  processTerm: (term: string, fieldName?: string) => term.toLowerCase(),
  fields: undefined,
  searchOptions: undefined,
  storeFields: []
}

const defaultSearchOptions = {
  combineWith: OR,
  prefix: false,
  fuzzy: false,
  maxFuzzy: 6,
  boost: {},
  weights: { fuzzy: 0.45, prefix: 0.375 }
}

const defaultAutoSuggestOptions = {
  combineWith: AND,
  prefix: (term: string, i: number, terms: string[]): boolean =>
    i === terms.length - 1
}

const assignUniqueTerm = (target: string[], term: string): void => {
  // Avoid adding duplicate terms.
  if (!target.includes(term)) target.push(term)
}

const assignUniqueTerms = (target: string[], source: readonly string[]): void => {
  for (const term of source) {
    // Avoid adding duplicate terms.
    if (!target.includes(term)) target.push(term)
  }
}

type Scored = { score: number }
const byScore = ({ score: a }: Scored, { score: b }: Scored) => b - a

const createMap = () => new Map()

interface SerializedIndexEntry {
  [key: string]: number
}

const objectToNumericMap = <T>(object: { [key: string]: T }): Map<number, T> => {
  const map = new Map()

  for (const key of Object.keys(object)) {
    map.set(parseInt(key, 10), object[key])
  }

  return map
}

// This regular expression matches any Unicode space or punctuation character
// Adapted from https://unicode.org/cldr/utility/list-unicodeset.jsp?a=%5Cp%7BZ%7D%5Cp%7BP%7D&abb=on&c=on&esc=on
const SPACE_OR_PUNCTUATION = /[\n\r -#%-*,-/:;?@[-\]_{}\u00A0\u00A1\u00A7\u00AB\u00B6\u00B7\u00BB\u00BF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u09FD\u0A76\u0AF0\u0C77\u0C84\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166E\u1680\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2000-\u200A\u2010-\u2029\u202F-\u2043\u2045-\u2051\u2053-\u205F\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E4F\u3000-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]+/u
