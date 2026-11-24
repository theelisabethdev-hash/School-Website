/**
 * Print works by hiding the whole document and showing one region. The site
 * header and nav live outside this page, so the rule has to be global.
 * `printScope` sets `data-print` on <body> for the length of the print dialog.
 * Without it (the browser's own Print), the list region prints.
 */
export type PrintScope = "list" | "drawer";

export function printScope(scope: PrintScope) {
  const clear = () => {
    delete document.body.dataset.print;
    window.removeEventListener("afterprint", clear);
  };
  document.body.dataset.print = scope;
  window.addEventListener("afterprint", clear);
  window.print();
}

export function PrintStyles() {
  return (
    <style jsx global>{`
      @media print {
        body {
          overflow: visible !important;
        }
        body a[href]::after {
          content: none !important;
        }
        body * {
          visibility: hidden;
        }
        body:not([data-print="drawer"]) [data-print-region="list"],
        body:not([data-print="drawer"]) [data-print-region="list"] *,
        body[data-print="drawer"] [data-print-region="drawer"],
        body[data-print="drawer"] [data-print-region="drawer"] * {
          visibility: visible;
        }
        body:not([data-print="drawer"]) [data-print-region="list"] {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
      }
    `}</style>
  );
}
