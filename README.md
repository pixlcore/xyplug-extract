<p align="center"><img src="https://raw.githubusercontent.com/pixlcore/xyplug-extract/refs/heads/main/logo.png" height="108" alt="Extract Anything"/></p>
<h1 align="center">Extract Anything</h1>

A versatile data extraction plugin for the [xyOps Workflow Automation System](https://xyops.io).

This Plugin uses the amazing open-source [Kreuzberg](https://kreuzberg.dev/) library to perform structured data extractions on files.  It can pull text and markdown out of PDFs, Word Docs or Powerpoint slides, cell grids or CSV out of Excel spreadsheets, perform OCR inside images to extract text, you name it!

To use this Plugin in your workflows, it requires one or more files as inputs.  Once the data is extracted, it is returned as job output data (which is passed to subsequent jobs in linked chains and workflows).

## Requirements

- docker

## Input Formats

This Plugin can extract structured data from **many** different formats, including:

### Office Documents

| Format | Extensions | MIME Type | Extraction Method | OCR Support | Special Features |
|--------|-----------|-----------|-------------------|-------------|------------------|
| PDF | `.pdf` | `application/pdf` | Native Rust (pdfium-render) | Yes | Metadata extraction, image extraction, text layer detection |
| Excel | `.xlsx`, `.xlsm`, `.xlsb`, `.xls`, `.xlam`, `.xla`, `.ods` | Various Excel MIME types | Native Rust (calamine) | No | Multi-sheet support, formula preservation |
| PowerPoint | `.pptx`, `.pptm`, `.ppsx` | `application/vnd.openxmlformats-officedocument.presentationml.presentation` | Native Rust (roxmltree) | Yes (for embedded images) | Slide extraction, image OCR, table detection |
| Word (Modern) | `.docx` | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | Native Rust | No | Preserves formatting, extracts metadata |
| Word (Legacy) | `.doc` | `application/msword` | LibreOffice conversion | No | Converts to DOCX then extracts |
| PowerPoint (Legacy) | `.ppt` | `application/vnd.ms-powerpoint` | LibreOffice conversion | No | Converts to PPTX then extracts |
| OpenDocument Text | `.odt` | `application/vnd.oasis.opendocument.text` | Native Rust | No | Full OpenDocument support |
| OpenDocument Spreadsheet | `.ods` | `application/vnd.oasis.opendocument.spreadsheet` | Native Rust (calamine) | No | Multi-sheet support |

### Text & Markup

| Format | Extensions | MIME Type | Extraction Method | OCR Support | Special Features |
|--------|-----------|-----------|-------------------|-------------|------------------|
| Plain Text | `.txt` | `text/plain` | Native Rust (streaming) | No | Line/word/character counting, memory-efficient streaming |
| Markdown | `.md`, `.markdown` | `text/markdown`, `text/x-markdown` | Native Rust (streaming) | No | Header extraction, link detection, code block detection |
| HTML | `.html`, `.htm` | `text/html`, `application/xhtml+xml` | Native Rust (html-to-markdown-rs) | No | Converts to Markdown, metadata extraction |
| XML | `.xml` | `application/xml`, `text/xml` | Native Rust (quick-xml streaming) | No | Element counting, unique element tracking |
| SVG | `.svg` | `image/svg+xml` | Native Rust (XML parser) | No | Treated as XML document |
| reStructuredText | `.rst` | `text/x-rst` | Native (rst-parser) | No | Full reST syntax support |
| Org Mode | `.org` | `text/x-org` | Native (org) | No | Emacs Org mode support |
| Rich Text Format | `.rtf` | `application/rtf`, `text/rtf` | Native (rtf-parser) | No | RTF 1.x support |

### Structured Data

| Format | Extensions | MIME Type | Extraction Method | OCR Support | Special Features |
|--------|-----------|-----------|-------------------|-------------|------------------|
| JSON | `.json` | `application/json`, `text/json` | Native Rust (serde_json) | No | Field counting, nested structure extraction |
| YAML | `.yaml` | `application/x-yaml`, `text/yaml`, `text/x-yaml` | Native Rust (serde_yaml) | No | Multi-document support, field counting |
| TOML | `.toml` | `application/toml`, `text/toml` | Native Rust (toml crate) | No | Configuration file support |
| CSV | `.csv` | `text/csv` | Native Rust | No | Tabular data extraction |
| TSV | `.tsv` | `text/tab-separated-values` | Native Rust | No | Tab-separated data extraction |

### Email

| Format | Extensions | MIME Type | Extraction Method | OCR Support | Special Features |
|--------|-----------|-----------|-------------------|-------------|------------------|
| EML | `.eml` | `message/rfc822` | Native Rust (mail-parser) | No | Header extraction, attachment listing, body text |
| MSG | `.msg` | `application/vnd.ms-outlook` | Native Rust (mail-parser) | No | Outlook message support, metadata extraction |

### Images

All image formats support OCR when configured with `ocr` parameter in `ExtractionConfig`.

| Format | Extensions | MIME Type | Extraction Method | OCR Support | Special Features |
|--------|-----------|-----------|-------------------|-------------|------------------|
| PNG | `.png` | `image/png` | Native Rust (image-rs) | Yes | EXIF metadata extraction |
| JPEG | `.jpg`, `.jpeg` | `image/jpeg`, `image/jpg` | Native Rust (image-rs) | Yes | EXIF metadata extraction |
| WebP | `.webp` | `image/webp` | Native Rust (image-rs) | Yes | Modern format support |
| BMP | `.bmp` | `image/bmp`, `image/x-bmp`, `image/x-ms-bmp` | Native Rust (image-rs) | Yes | Uncompressed format |
| TIFF | `.tiff`, `.tif` | `image/tiff`, `image/x-tiff` | Native Rust (image-rs) | Yes | Multi-page support |
| GIF | `.gif` | `image/gif` | Native Rust (image-rs) | Yes | Animation frame extraction |
| JPEG 2000 | `.jp2`, `.jpx`, `.jpm`, `.mj2` | `image/jp2`, `image/jpx`, `image/jpm`, `image/mj2` | Native Rust (image-rs) | Yes | Advanced JPEG format |
| PNM Family | `.pnm`, `.pbm`, `.pgm`, `.ppm` | `image/x-portable-anymap`, etc. | Native Rust (image-rs) | Yes | NetPBM formats |

### Archives

| Format | Extensions | MIME Type | Extraction Method | OCR Support | Special Features |
|--------|-----------|-----------|-------------------|-------------|------------------|
| ZIP | `.zip` | `application/zip`, `application/x-zip-compressed` | Native Rust (zip crate) | No | File listing, text content extraction |
| TAR | `.tar`, `.tgz` | `application/x-tar`, `application/tar`, `application/x-gtar`, `application/x-ustar` | Native Rust (tar crate) | No | Unix archive support, compression detection |
| 7-Zip | `.7z` | `application/x-7z-compressed` | Native Rust (sevenz-rust) | No | High compression format support |
| Gzip | `.gz` | `application/gzip` | Native Rust | No | Gzip compression support |

### Academic & Publishing (Native)

| Format | Extensions | MIME Type | Extraction Method | OCR Support | Special Features |
|--------|-----------|-----------|-------------------|-------------|------------------|
| LaTeX | `.tex`, `.latex` | `application/x-latex`, `text/x-tex` | Native (manual parser) | No | Full LaTeX document support |
| EPUB | `.epub` | `application/epub+zip` | Native (zip + roxmltree + html-to-markdown-rs) | No | E-book format, metadata extraction |
| BibTeX | `.bib` | `application/x-bibtex`, `application/x-biblatex` | Native (biblatex) | No | Bibliography database support |
| Typst | `.typst` | `application/x-typst` | Native (typst-syntax) | No | Modern typesetting format |
| Jupyter Notebook | `.ipynb` | `application/x-ipynb+json` | Native (JSON parsing) | No | Code cells, markdown cells, output extraction |
| FictionBook | - | `application/x-fictionbook+xml` | Native (fb2) | No | XML-based e-book format |
| DocBook | - | `application/docbook+xml` | Native (roxmltree) | No | Technical documentation format |
| JATS | - | `application/x-jats+xml` | Native (roxmltree) | No | Journal article XML format |
| OPML | - | `application/x-opml+xml` | Native (roxmltree) | No | Outline format |
| RIS | - | `application/x-research-info-systems` | Native (ris-parser) | No | Citation format |
| EndNote XML | - | `application/x-endnote+xml` | Native (XML parser) | No | Reference manager format |
| CSL JSON | - | `application/csl+json` | Native (JSON parser) | No | Citation Style Language JSON |

### Markdown Variants (Native)

| Format | MIME Type | Extraction Method | Special Features |
|--------|-----------|-------------------|------------------|
| CommonMark | `text/x-commonmark` | Native (pulldown-cmark) | Standard Markdown spec |
| GitHub Flavored Markdown | `text/x-gfm` | Native (pulldown-cmark) | GFM extensions (tables, strikethrough, etc.) |
| MultiMarkdown | `text/x-multimarkdown` | Native (pulldown-cmark) | MMD extensions |
| Markdown Extra | `text/x-markdown-extra` | Native (pulldown-cmark) | PHP Markdown Extra extensions |

### Other Formats

| Format | MIME Type | Extraction Method | Special Features |
|--------|-----------|-------------------|------------------|
| Man Pages | `text/x-mdoc` | Native (mdoc-parser) | Unix manual page format |
| Troff | `text/troff` | Native (troff-parser) | Unix document format |
| POD | `text/x-pod` | Native (pod-parser) | Perl documentation format |
| DokuWiki | `text/x-dokuwiki` | Native (dokuwiki-parser) | Wiki markup format |

See [Kreuzberg Format Support](https://docs.kreuzberg.dev/reference/formats/) for more details.

## Output Format

Your extracted file data will be in the job output data, which can then be used in linked jobs or attached workflow nodes.  The output format looks like this:

```json
{
	"filename": "document.pdf",
	"content": "Denny Gunawan\n221 Queen St\nMelbourne VIC 3000\n123 Somewhere St, Melbourne VIC 3000 $39.60\n(03) 1234 5678\nInvoice Number: #20130304\nOrganic Items Price/kg Quantity(kg) Subtotal\nApple $5.00 1 $5.00\nOrange $1.99 2 $3.98\nWatermelon $1.69 3 $5.07\nMango $9.56 2 $19.12\nPeach $2.99 1 $2.99\nSubtotal $36.00\nGST (10%) $3.60\n* Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam sodales Total $39.60\ndapibus fermentum. Nunc adipiscing, magna sed scelerisque cursus, erat\nlectus dapibus urna, sed facilisis leo dui et ipsum.",
	"mimeType": "application/pdf",
	"metadata": {
		"format_type": "pdf",
		"height": 842,
		"is_encrypted": false,
		"page_count": 1,
		"pdf_version": "1.5",
		"producer": "Prince 16 (www.princexml.com)",
		"quality_score": 1,
		"title": "Sunny Farm Invoice Sample",
		"width": 595
	},
	"tables": [
		{
			"cells": [
				[ "Denny Gunawan" ],
				[ "221 Queen St" ],
				[ "Melbourne VIC 3000" ],
				[ "123 Somewhere St, Melbourne VIC 3000 $39.60" ],
				[ "(03) 1234 5678" ],
				[ "Invoice Number: #20130304" ],
				[ "Organic Items Price/kg Quantity(kg) Subtotal" ],
				[ "Apple $5.00 1 $5.00" ],
				[ "Orange $1.99 2 $3.98" ],
				[ "Watermelon $1.69 3 $5.07" ],
				[ "Mango $9.56 2 $19.12" ],
				[ "Peach $2.99 1 $2.99" ],
				[ "Subtotal $36.00" ],
				[ "GST (10%) $3.60" ],
				[ "* Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam sodales Total $39.60" ],
				[ "dapibus fermentum. Nunc adipiscing, magna sed scelerisque cursus, erat" ],
				[ "lectus dapibus urna, sed facilisis leo dui et ipsum." ]
			],
			"markdown": "| Denny Gunawan |\n| --- |\n| 221 Queen St |\n| Melbourne VIC 3000 |\n| 123 Somewhere St, Melbourne VIC 3000 $39.60 |\n| (03) 1234 5678 |\n| Invoice Number: #20130304 |\n| Organic Items Price/kg Quantity(kg) Subtotal |\n| Apple $5.00 1 $5.00 |\n| Orange $1.99 2 $3.98 |\n| Watermelon $1.69 3 $5.07 |\n| Mango $9.56 2 $19.12 |\n| Peach $2.99 1 $2.99 |\n| Subtotal $36.00 |\n| GST (10%) $3.60 |\n| * Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam sodales Total $39.60 |\n| dapibus fermentum. Nunc adipiscing, magna sed scelerisque cursus, erat |\n| lectus dapibus urna, sed facilisis leo dui et ipsum. |\n",
			"pageNumber": 1
		}
	],
	"detectedLanguages": null,
	"chunks": null,
	"images": null,
	"pages": null
}
```

When batch mode is enabled, or when multiple files are provided, each file's extractions are pushed onto an `extractions` array.  Example:

```json
{
	"extractions": [
		{
			"filename": "document1.pdf",
			"content": "..."
		},
		{
			"filename": "document2.pdf",
			"content": "..."
		}
	]
}		
```

If you also check the "Attach Files" checkbox in the plugin parameters, this will attach all text output as files when the job completes.

## Local Testing

Use this sample JSON to pass a local file into the Plugin (the file should be in the current directory):

```json
{
	"xy": 1,
	"input": {
		"files": [
			{ "filename": "document.pdf" }
		]
	}
}
```

Example pipe command:

```sh
echo '{ "xy":1, "input":{ "files":[ { "filename": "document.pdf" } ] } }' | node index.js
```

## License

MIT
