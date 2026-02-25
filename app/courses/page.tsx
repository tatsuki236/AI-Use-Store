import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "コース一覧",
};

const courseGradients = [
  "from-indigo-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-red-500",
  "from-purple-500 to-fuchsia-600",
  "from-sky-500 to-cyan-600",
  "from-rose-500 to-pink-600",
];

const courseIcons = ["📚", "🐍", "⚡", "🎨", "🌿", "📘", "🧠", "🔧"];

function getGradient(index: number) {
  return courseGradients[index % courseGradients.length];
}

function getIcon(index: number) {
  return courseIcons[index % courseIcons.length];
}

export default async function CoursesPage() {
  const supabase = await createClient();

  const { data: courses } = await supabase
    .from("courses")
    .select("*, lessons:lessons(count)")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/8 via-background to-accent/20 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl font-extrabold tracking-tight">コース一覧</h1>
          <p className="mt-2 text-muted-foreground">
            体系的に学べるコースで、スキルを確実に身につけよう
          </p>
        </div>
      </section>

      {/* Main Content with Sidebar */}
      <div className="container mx-auto max-w-6xl py-8 px-4 flex gap-8">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Column */}
        <main className="flex-1 min-w-0">
          {!courses || courses.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              コースは準備中です
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course, index) => {
                const lessonCount = (course.lessons as unknown as { count: number }[])?.[0]?.count ?? 0;
                return (
                  <Link key={course.id} href={`/courses/${course.id}`} className="group">
                    <div className="relative bg-card rounded-2xl overflow-hidden border border-border/60 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 h-full flex flex-col">
                      {/* Badges */}
                      <div className="absolute top-2.5 left-2.5 z-10 flex gap-1.5">
                        {index === 0 && (
                          <span className="text-[10px] font-bold text-white bg-primary px-2 py-0.5 rounded-full shadow-sm">
                            おすすめ
                          </span>
                        )}
                        {index < 3 && (
                          <span className="text-[10px] font-bold text-white bg-amber-500 px-2 py-0.5 rounded-full shadow-sm">
                            人気 No.{index + 1}
                          </span>
                        )}
                      </div>
                      {/* Thumbnail */}
                      {course.thumbnail_url ? (
                        <div className="aspect-video overflow-hidden">
                          <img
                            src={course.thumbnail_url}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className={`aspect-video bg-gradient-to-br ${getGradient(index)} flex items-center justify-center`}>
                          <span className="text-5xl drop-shadow-lg">{getIcon(index)}</span>
                        </div>
                      )}
                      {/* Content */}
                      <div className="p-5 flex-1 flex flex-col">
                        <h3 className="font-bold text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                          {course.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed flex-1">
                          {course.description}
                        </p>
                        {/* Rating placeholder */}
                        <div className="mt-3 flex items-center gap-1">
                          <span className="text-amber-400 text-sm">★★★★★</span>
                          <span className="text-xs text-muted-foreground">(4.8)</span>
                        </div>
                        <div className="mt-3 flex items-center justify-between pt-3 border-t border-border/40">
                          <span className="text-xs text-muted-foreground">
                            全{lessonCount}レッスン
                          </span>
                          {course.price === 0 ? (
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                              無料
                            </Badge>
                          ) : (
                            <span className="font-bold text-base text-primary">
                              ¥{course.price.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
