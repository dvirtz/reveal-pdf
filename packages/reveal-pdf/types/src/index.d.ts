interface RevealPdfOptions {
    // whether to make each pdf link to its source
    // default: false
    addLink?: boolean;
}

interface RevealOptionsWithPdf extends RevealOptions {
    pdf: RevealPdfOptions;
}