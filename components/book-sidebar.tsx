"use client";

import { usePathname } from "next/navigation";
import { MobileSidebar, SidebarNav, type SidebarGroup } from "@/components/sidebar-nav";

export interface BookSidebarProps {
  book: { slug: string; name: string };
  /** The book's parts, in order, each with its chapters. */
  parts: { title: string; docs: { slug: string; navTitle: string }[] }[];
}

/** A book's own table of contents: its cover, then each part's chapters, numbered through the book. */
function BookTree({ book, parts, onNavigate }: BookSidebarProps & { onNavigate?: () => void }) {
  let number = 0;
  const groups: SidebarGroup[] = [
    {
      name: null,
      sections: parts.map((part) => ({
        name: part.title || "Chapters",
        items: part.docs.map((d) => ({
          href: `/books/${d.slug}`,
          title: d.navTitle,
          number: ++number,
          nested: true,
        })),
      })),
    },
  ];
  return (
    <SidebarNav
      title={book.name}
      back={{ href: "/books", label: "All books" }}
      home={{ href: `/books/${book.slug}`, label: "Overview" }}
      groups={groups}
      onNavigate={onNavigate}
    />
  );
}

export function BookSidebar(props: BookSidebarProps) {
  return <BookTree {...props} />;
}

export function MobileBookSidebar(props: BookSidebarProps) {
  const pathname = usePathname();
  const current =
    props.parts
      .flatMap((p) => p.docs)
      .find((d) => pathname === `/books/${d.slug}` || pathname.startsWith(`/books/${d.slug}/`))?.navTitle ??
    `${props.book.name} overview`;

  return (
    <MobileSidebar current={current}>{(close) => <BookTree {...props} onNavigate={close} />}</MobileSidebar>
  );
}
