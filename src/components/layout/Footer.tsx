export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t py-6 mt-auto">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        &copy; {year} SPMVV EDUBOT. All rights reserved.
      </div>
    </footer>
  );
}
