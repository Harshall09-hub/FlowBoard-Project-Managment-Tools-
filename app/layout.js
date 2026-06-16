import './globals.css';

export const metadata = {
  title: 'FlowBoard - Project Management',
  description: 'Collaborative project management tool with Kanban boards',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
