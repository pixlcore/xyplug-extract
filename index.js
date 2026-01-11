// Extract anything from any file
// A xyOps Plugin utilizing the amazing Kreuzberg library
// MIT License

import { extractFileSync } from '@kreuzberg/node';

// read job data from stdin
const chunks = [];
for await (const chunk of process.stdin) { chunks.push(chunk); }
let job = JSON.parse( chunks.join('') );
let params = job.params || {};
let config = params.config || {
	ocr: {
        backend: 'tesseract',
        language: 'eng',
        tesseractConfig: {
            psm: 3
        }
    }
};

// make sure we actually have files
if (!job.input || !job.input.files || !job.input.files.length) {
	console.log( JSON.stringify({ xy: 1, code: 1, description: "No input files provided to job." }) );
	process.exit(0);
}

// init structured output
let output = {
	extractions: []
};

// loop over files
let num_files = job.input.files.length;
let num_errors = 0;
console.log(`Starting processing on ${num_files} files...`);

job.input.files.forEach( function(file, idx) {
	console.log("Processing file: " + file.filename);
	let result = {};
	try {
		result = extractFileSync( file.filename, null, config );
	}
	catch (err) {
		console.log('' + err);
		result.error = '' + err;
		num_errors++;
	}
	
	result.filename = file.filename;
	if (result.content && (typeof(result.content) == 'string')) result.content = result.content.replace(/\r\n/g, "\n");
	output.extractions.push(result);
	
	// update job progress
	console.log( JSON.stringify({ xy: 1, progress: (idx + 1) / num_files }) );
} );

console.log(`Processing complete.`);

// simplify output if only a single file, and not in batch mode
if ((output.extractions.length == 1) && !params.batch) {
	output = output.extractions[0];
}

// job complete
if (num_errors == job.input.files.length) {
	// all files failed
	console.log( JSON.stringify({ xy: 1, code: 1, description: "All files failed extraction. See job output or data for details.", data: output }) );
}
else {
	// at least one file succeeded
	console.log( JSON.stringify({ xy: 1, code: 0, data: output }) );
}
