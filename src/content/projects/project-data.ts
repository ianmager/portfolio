export interface Project {
  title: string;
  description: string;
  stack: string[];
  impact: string;
  image?: string;
  repo?: string;
  demo?: string;
  link?: string;
}

export const projects: Project[] = [
  {
    title: "A Wall of Thoughts",
    description:
      "A public graffiti wall on the open web. Anyone can read messages; signed-in visitors click the wall, write a short tag, and leave it styled in place. Messages show oldest first on a full-width concrete-style canvas.",
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Supabase", "Vercel"],
    impact:
      "Shipped a live full-stack app with Google auth, Postgres + row-level security, and custom placement/styling stored per message.",
    image: "projects/a-wall-of-thoughts.png",
    repo: "https://github.com/ianmager/a-wall-of-thoughs",
    demo: "https://a-wall-of-thoughs.vercel.app/",
  },
];
