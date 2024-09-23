document.getElementById("downloadTextButton").addEventListener("click", function () {
    const letterContent = document.getElementById("letterContent").value;

    // Create a blob with the letter content
    const blob = new Blob([letterContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    // Create a link element for downloading
    const link = document.createElement("a");
    link.href = url;
    link.download = "official_letter.txt"; // Name for the downloaded file

    // Trigger the download
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
});

document.getElementById("downloadPdfButton").addEventListener("click", function () {
    const letterContent = document.getElementById("letterContent").value;
    const imageInput = document.getElementById("imageInput").files[0];
    const transparencyLevel = document.getElementById("transparencyRange").value / 100;

    if (imageInput) {
        const reader = new FileReader();
        reader.onload = function (event) {
            const imgData = event.target.result;

            // Preview the content on the canvas
            previewPDF(letterContent, imgData, transparencyLevel);
        };
        reader.readAsDataURL(imageInput);
    } else {
        // Preview without image
        previewPDF(letterContent, null, transparencyLevel);
    }
});

function previewPDF(letterContent, imgData, transparencyLevel) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const margin = 10;
    const pdfWidth = 210; // A4 width in mm
    const pdfHeight = 297; // A4 height in mm
    const dpi = 72; // DPI for the canvas
    canvas.width = (pdfWidth - 2 * margin) * dpi / 25.4;
    canvas.height = (pdfHeight - 2 * margin) * dpi / 25.4;

    // Set background image
    if (imgData) {
        const img = new Image();
        img.onload = function () {
            ctx.globalAlpha = transparencyLevel;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            ctx.globalAlpha = 1; // Reset alpha for text
            drawText(ctx, letterContent, margin, margin, canvas.width - 2 * margin, canvas.height - 2 * margin);
            showPreview(canvas.toDataURL("image/png"));
        };
        img.src = imgData;
    } else {
        drawText(ctx, letterContent, margin, margin, canvas.width - 2 * margin, canvas.height - 2 * margin);
        showPreview(canvas.toDataURL("image/png"));
    }
}

function drawText(ctx, text, x, y, maxWidth, maxHeight) {
    ctx.fillStyle = "black"; // Set text color
    ctx.font = "16px Arial"; // Set text font and size
    const lines = text.split('\n');
    let lineHeight = 20; // Height of each line of text

    lines.forEach((line) => {
        const words = line.split(' ');
        let currentLine = '';

        for (let word of words) {
            const testLine = currentLine + word + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;

            if (testWidth > maxWidth) {
                ctx.fillText(currentLine, x, y);
                currentLine = word + ' ';
                y += lineHeight; // Move to the next line
            } else {
                currentLine = testLine;
            }
        }
        ctx.fillText(currentLine, x, y); // Draw the last line
        y += lineHeight; // Move to the next line
    });
}

function showPreview(dataUrl) {
    const previewWindow = window.open("", "_blank");
    previewWindow.document.write(`<img src="${dataUrl}" style="max-width: 100%; height: auto;">`);
    previewWindow.document.title = "PDF Preview";
    previewWindow.document.close();
}
