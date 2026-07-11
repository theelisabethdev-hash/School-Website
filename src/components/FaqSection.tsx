"use client";

import { useState } from "react";
import type { FaqItem } from "@/lib/seo";

const BLUE = "#214AB3";
const GOLD = "#f0ad4e";

/**
 * Visible FAQ accordion. Pair with `faqJsonLd(items)` (rendered as a
 * <script type="application/ld+json"> by the page) so the same facts are
 * both human-readable and machine-quotable — this is what Google's AI
 * Overviews and chat assistants (ChatGPT, Perplexity) pull answers from.
 */
export default function FaqSection({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="popular-section-wthree">
      <div className="container">
        <div className="wthree-heading">
          <h2 className="welcome_header">Frequently Asked Questions</h2>
        </div>
        <div>
          {items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.question} style={{ marginBottom: "10px" }}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    background: isOpen ? BLUE : "#f5f5f5",
                    color: isOpen ? "#fff" : BLUE,
                    border: `1px solid ${BLUE}`,
                    borderRadius: "6px",
                    padding: "12px 16px",
                    fontSize: "16px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <span>{item.question}</span>
                  <span style={{ fontSize: "14px", flexShrink: 0 }}>{isOpen ? "▲" : "▼"}</span>
                </button>
                {isOpen && (
                  <p
                    style={{
                      margin: 0,
                      padding: "12px 16px",
                      border: `1px solid ${GOLD}`,
                      borderTop: "none",
                      borderRadius: "0 0 6px 6px",
                      color: "#333",
                      lineHeight: 1.6,
                    }}
                  >
                    {item.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
