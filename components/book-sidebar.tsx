"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { DocLinks, Group, MobileSidebar, linkClass, useCurrentLinkInView } from "@/components/docs-sidebar";

export interface BookSidebarProps {
  book: { slug: string; name: string };
  /** The book's parts, in order, each with its chapters. */
  parts: { title: string; docs: { slug: string; navTitle: string }[] }[];
}

/** A book's own table of contents: its cover, then each part's chapters. */
function BookTree({ book, parts, onNavigate }: BookSidebarProps & { onNavigate?: () => void }) {
  const pathname = usePathname();
  const navRef = useCurrentLinkInView();
  const cover = `/books/${book.slug}`;
  const hrefOf = (slug: string) => `/books/${slug}`;

  return (
    <nav ref={navRef} aria-label={book.name} className="space-y-4">
      <Link
        href="/books"
        onClick={onNavigate}
        className="group flex items-center gap-2 text-sm font-semibold text-foreground"
      >
        <ChevronLeft size={15} aria-hidden className="text-dim transition-colors group-hover:text-accent" />
        {book.name}
        <span className="sr-only">: all books</span>
      </Link>
      <ul className="border-l border-border">
        <li>
          <Link
            href={cover}
            onClick={onNavigate}
            aria-current={pathname === cover ? "page" : undefined}
            className={linkClass(pathname === cover)}
          >
            Overview
          </Link>
        </li>
      </ul>
      {parts.map((part) =>
        part.title ? (
          <Group key={part.title} title={part.title}>
            <DocLinks docs={part.docs} hrefOf={hrefOf} onNavigate={onNavigate} nested />
          </Group>
        ) : (
          <ul key="chapters" className="border-l border-border">
            <DocLinks docs={part.docs} hrefOf={hrefOf} onNavigate={onNavigate} nested />
          </ul>
        ),
      )}
    </nav>
  );
}

export function BookSidebar(props: BookSidebarProps) {
  return <BookTree {...props} />;
}

export function MobileBookSidebar(props: BookSidebarProps) {
  const pathname = usePathname();
  const current =
    props.parts.flatMap((p) => p.docs).find((d) => pathname === `/books/${d.slug}` || pathname.startsWith(`/books/${d.slug}/`))?.navTitle ??
    `${props.book.name} overview`;

  return (
    <MobileSidebar current={current}>{(close) => <BookTree {...props} onNavigate={close} />}</MobileSidebar>
  );
}
