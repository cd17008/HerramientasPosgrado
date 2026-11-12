import {
    Paragraph,
    TextRun,
    Table,
    TableRow,
    TableCell,
    WidthType,
    BorderStyle,
    AlignmentType,
    ShadingType,
    VerticalAlign,
    ImageRun,
    Packer
} from 'docx';

export const FONT_FAMILY = 'Calibri';

export const BORDERS_ALL = {
    top: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
    left: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
    right: { style: BorderStyle.SINGLE, size: 4, color: '000000' }
};

export const BORDERS_NONE = {
    top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
};

export const SHADING_HEADER = {
    type: ShadingType.CLEAR,
    color: 'auto',
    fill: 'D9E1F2' // Sombreado institucional gris-azulado suave
};

/**
 * Crea un párrafo estándar en Calibri
 */
export function crearParrafo(texto, { bold = false, size = 20, align = AlignmentType.LEFT, spaceAfter = 40 } = {}) {
    return new Paragraph({
        alignment: align,
        spacing: { after: spaceAfter, line: 240 },
        children: [
            new TextRun({
                text: String(texto ?? ''),
                bold,
                size, // 20 = 10pt, 22 = 11pt
                font: FONT_FAMILY
            })
        ]
    });
}

/**
 * Crea una celda con estilos consistentes
 */
export function crearCelda(children, {
    columnSpan = 1,
    rowSpan = 1,
    widthPct,
    shading,
    borders = BORDERS_ALL,
    vAlign = VerticalAlign.CENTER
} = {}) {
    const contenido = Array.isArray(children) ? children : [children];
    return new TableCell({
        columnSpan,
        rowSpan,
        shading,
        borders,
        verticalAlign: vAlign,
        width: widthPct ? { size: widthPct, type: WidthType.PERCENTAGE } : undefined,
        margins: { top: 60, bottom: 60, left: 100, right: 100 },
        children: contenido
    });
}

/**
 * Barra de título de sección numerada (ej. "1. DATOS GENERALES")
 */
export function crearFilaTituloSeccion(titulo, colSpanTotal = 5) {
    return new TableRow({
        children: [
            crearCelda(crearParrafo(titulo, { bold: true, size: 20, spaceAfter: 0 }), {
                columnSpan: colSpanTotal,
                shading: SHADING_HEADER
            })
        ]
    });
}

/**
 * Encabezado Institucional FIA-UES (Logo opcional en ArrayBuffer/Uint8Array)
 */
export function construirEncabezadoInstitucional({
    refInforme = 'EP-0000-2026',
    fechaEmision = '',
    periodoTexto = '',
    logoBuffer = null,
    logoType = 'png'
}) {
    const tieneLogoValido = logoBuffer && logoBuffer.byteLength > 0;
    const bloqueLogo = logoBuffer
        ? [
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new ImageRun({
                        data: logoBuffer,
                        transformation: { width: 55, height: 65 }
                    })
                ]
            })
        ]
        : [crearParrafo('UES', { bold: true, size: 24, align: AlignmentType.CENTER })];

    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            new TableRow({
                children: [
                    crearCelda(bloqueLogo, { rowSpan: 3, widthPct: 14, borders: BORDERS_NONE }),
                    crearCelda(
                        [
                            crearParrafo('UNIVERSIDAD DE EL SALVADOR', { bold: true, size: 22, align: AlignmentType.CENTER, spaceAfter: 20 }),
                            crearParrafo('FACULTAD DE INGENIERIA Y ARQUITECTURA', { bold: true, size: 20, align: AlignmentType.CENTER, spaceAfter: 0 })
                        ],
                        { widthPct: 62, borders: BORDERS_NONE }
                    ),
                    crearCelda(crearParrafo(`Ref. ${refInforme}`, { bold: true, size: 20, align: AlignmentType.RIGHT, spaceAfter: 0 }), {
                        widthPct: 24,
                        borders: BORDERS_NONE
                    })
                ]
            }),
            new TableRow({
                children: [
                    crearCelda(crearParrafo('INFORME DE ACTIVIDADES', { bold: true, size: 22, align: AlignmentType.CENTER, spaceAfter: 0 }), {
                        borders: BORDERS_NONE
                    }),
                    crearCelda(crearParrafo(fechaEmision, { size: 20, align: AlignmentType.RIGHT, spaceAfter: 0 }), {
                        borders: BORDERS_NONE
                    })
                ]
            }),
            new TableRow({
                children: [
                    crearCelda(crearParrafo('UNIDAD/ESCUELA: ESCUELA DE POSGRADO', { bold: true, size: 19, spaceAfter: 0 }), {
                        borders: BORDERS_NONE
                    }),
                    crearCelda(crearParrafo(`PERIODO: ${periodoTexto}`, { bold: true, size: 19, align: AlignmentType.RIGHT, spaceAfter: 0 }), {
                        borders: BORDERS_NONE
                    })
                ]
            })
        ]
    });
}

/**
 * Sección 6: Cuadro de Nivel de Desempeño con casilla marcada ("x")
 */
export function construirTablaDesempeno({ nivelSeleccionado = 'Excelente', comentarios = '' }) {
    const niveles = ['Excelente', 'Sobresaliente', 'Muy Bueno', 'Bueno', 'Deficiente'];
    const celdasNiveles = [];

    niveles.forEach((nivel) => {
        const marcado = nivel.toLowerCase() === nivelSeleccionado.toLowerCase() ? 'X' : '';
        celdasNiveles.push(
            crearCelda(crearParrafo(marcado, { bold: true, size: 20, align: AlignmentType.CENTER, spaceAfter: 0 }), {
                widthPct: 4
            }),
            crearCelda(crearParrafo(nivel, { size: 19, align: AlignmentType.CENTER, spaceAfter: 0 }), {
                widthPct: 16
            })
        );
    });

    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            crearFilaTituloSeccion('6. NIVEL DE DESEMPEÑO', 10),
            new TableRow({ children: celdasNiveles }),
            new TableRow({
                children: [
                    crearCelda(
                        [
                            crearParrafo('COMENTARIOS SOBRE EL NIVEL DE DESEMPEÑO', { bold: true, size: 19, spaceAfter: 40 }),
                            crearParrafo(comentarios, { size: 20, spaceAfter: 20 })
                        ],
                        { columnSpan: 10 }
                    )
                ]
            })
        ]
    });
}

/**
 * Bloque de firma del Director de la Escuela de Posgrado
 */
export function construirBloqueFirma() {
    return [
        new Paragraph({ spacing: { before: 500, after: 0 }, children: [] }),
        crearParrafo('Maestro Elmer Arturo Carballo Ruiz', { bold: true, size: 20, align: AlignmentType.CENTER, spaceAfter: 20 }),
        crearParrafo('Director', { bold: true, size: 20, align: AlignmentType.CENTER, spaceAfter: 20 }),
        crearParrafo('Escuela de Posgrado FIA-UES', { bold: true, size: 20, align: AlignmentType.CENTER, spaceAfter: 0 })
    ];
}

/**
 * Empaqueta y descarga el documento Word en el navegador
 */
export async function descargarDocumentoWord(doc, nombreArchivo) {
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo.endsWith('.docx') ? nombreArchivo : `${nombreArchivo}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}