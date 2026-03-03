import { motion } from "framer-motion";
import { Shield, Code2, BarChart3, Github, Linkedin, Mail, Star, Users, Zap } from "lucide-react";
import { useThemeColors } from "../hooks/useThemeColors";
import Header from "../components/Header";
import Footer from "../components/Footer";

const teamMembers = [
    {
        name: "P Harsha",
        role: "Full Stack Developer & Team Lead",
        roleColor: "#3b82f6",
        roleBg: "rgba(59,130,246,0.12)",
        roleBorder: "rgba(59,130,246,0.30)",
        icon: Shield,
        iconColor: "#3b82f6",
        description:
            "Architecting the CivicWatch platform from the ground up — building scalable APIs, managing the database, and leading the team with a passion for civic tech.",
        tags: ["Node.js", "MongoDB", "React", "TypeScript"],
        image: "/team-member1.jpg",
        socials: {
            github: "https://github.com/klu2300033050",
            linkedin: "https://www.linkedin.com/in/pasala-harsha-satya-sai-phani-bb9b56368/",
            email: "mailto:pasalaharsha1@gmail.com",
        },
    },
    {
        name: "Rahul Karanam",
        role: "UI/UX & Frontend Engineer",
        roleColor: "#f5a623",
        roleBg: "rgba(245,166,35,0.12)",
        roleBorder: "rgba(245,166,35,0.30)",
        icon: Code2,
        iconColor: "#f5a623",
        description:
            "Crafting pixel-perfect, accessible, and animated user interfaces that make civic reporting feel effortless and engaging for every citizen.",
        tags: ["React", "Tailwind CSS", "Framer Motion", "Figma"],
        image: "/team-member2.jpg",
        socials: {
            github: "https://github.com/rahulkaranam05",
            linkedin: "https://www.linkedin.com/in/rahulkaranam05/",
            email: "mailto:rahulkarnam2005@gmail.com",
        },
    },
    {
        name: "M Vamsi",
        role: "Backend & Systems Engineer",
        roleColor: "#10b981",
        roleBg: "rgba(16,185,129,0.12)",
        roleBorder: "rgba(16,185,129,0.30)",
        icon: BarChart3,
        iconColor: "#10b981",
        description:
            "Powering real-time notifications, socket integrations, and data pipelines that keep CivicWatch fast, reliable and always in sync.",
        tags: ["Node.js", "Socket.io", "REST APIs", "DevOps"],
        image: "/team-member3.jpg",
        socials: {
            github: "#",
            linkedin: "#",
            email: "mailto:vamsimerla1@gmail.com",
        },
    },
];

const stats = [
    { icon: Users, value: "3", label: "Core Developers" },
    { icon: Zap, value: "100%", label: "Passion Driven" },
    { icon: Star, value: "Open", label: "Source Project" },
];

const About = () => {
    const tc = useThemeColors();

    return (
        <div className="min-h-screen flex flex-col" style={{ background: tc.dark ? "#060f1e" : "#f0f6fe" }}>
            <Header />

            {/* Hero Section */}
            <section
                className="pt-32 pb-20 relative overflow-hidden"
                style={{
                    background: tc.dark
                        ? "linear-gradient(135deg, #060f1e 0%, #0a1628 50%, #0d1e35 100%)"
                        : "linear-gradient(135deg, #f0f6fe 0%, #e8f0fb 50%, #dce8f9 100%)",
                }}
            >
                {/* Decorative orbs */}
                <div
                    className="absolute top-20 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20"
                    style={{ background: "radial-gradient(circle, #1e4d8c, transparent)" }}
                />
                <div
                    className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-15"
                    style={{ background: "radial-gradient(circle, #f5a623, transparent)" }}
                />

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
                            style={{
                                background: tc.dark ? "rgba(30,77,140,0.25)" : "rgba(30,77,140,0.10)",
                                border: `1px solid ${tc.dark ? "rgba(30,77,140,0.50)" : "rgba(30,77,140,0.25)"}`,
                                color: "#f5a623",
                            }}
                        >
                            <Star className="h-4 w-4" />
                            About CivicWatch
                        </div>

                        <h1
                            className="text-5xl sm:text-6xl font-extrabold mb-6 leading-tight"
                            style={{ color: tc.textPri }}
                        >
                            Built by students,{" "}
                            <span
                                style={{
                                    background: "linear-gradient(135deg, #f5a623, #f97316)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                }}
                            >
                                for the community
                            </span>
                        </h1>
                        <p
                            className="text-xl max-w-2xl mx-auto leading-relaxed"
                            style={{ color: tc.textMuted }}
                        >
                            CivicWatch is a student-led initiative to bridge the gap between citizens and local
                            authorities. We believe transparency and technology can transform how civic issues are
                            reported and resolved.
                        </p>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        className="mt-16 flex flex-wrap justify-center gap-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                    >
                        {stats.map(({ icon: Icon, value, label }) => (
                            <div
                                key={label}
                                className="flex flex-col items-center gap-2 px-8 py-5 rounded-2xl"
                                style={{
                                    background: tc.dark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.80)",
                                    border: `1px solid ${tc.cardBorder}`,
                                    backdropFilter: "blur(12px)",
                                }}
                            >
                                <Icon className="h-6 w-6" style={{ color: "#f5a623" }} />
                                <span className="text-2xl font-bold" style={{ color: tc.textPri }}>
                                    {value}
                                </span>
                                <span className="text-sm" style={{ color: tc.textMuted }}>
                                    {label}
                                </span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-24 relative">
                <div
                    className="absolute top-0 left-0 right-0 h-px"
                    style={{
                        background:
                            "linear-gradient(to right, transparent, rgba(30,77,140,0.4), transparent)",
                    }}
                />

                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-4xl sm:text-5xl font-bold mb-4" style={{ color: tc.textPri }}>
                            Meet Our Team
                        </h2>
                        <p className="text-lg max-w-xl mx-auto" style={{ color: tc.textMuted }}>
                            We are passionate students dedicated to making a difference through civic technology.
                        </p>
                    </motion.div>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {teamMembers.map((member, i) => (
                            <motion.div
                                key={member.name}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ delay: i * 0.15, duration: 0.55 }}
                                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                                className="group relative rounded-3xl overflow-hidden flex flex-col"
                                style={{
                                    background: tc.dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.95)",
                                    border: `1px solid ${tc.cardBorder}`,
                                    backdropFilter: "blur(16px)",
                                    boxShadow: tc.dark
                                        ? "0 8px 32px rgba(0,0,0,0.4)"
                                        : "0 8px 32px rgba(30,77,140,0.10)",
                                }}
                            >
                                {/* Top accent bar */}
                                <div
                                    className="h-1 w-full"
                                    style={{
                                        background: `linear-gradient(90deg, ${member.roleColor}, transparent)`,
                                    }}
                                />

                                {/* Photo */}
                                <div className="relative w-full aspect-[4/3] overflow-hidden">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                                    />
                                    {/* Gradient overlay at bottom of image */}
                                    <div
                                        className="absolute inset-x-0 bottom-0 h-1/3"
                                        style={{
                                            background: tc.dark
                                                ? "linear-gradient(to top, rgba(6,15,30,0.95), transparent)"
                                                : "linear-gradient(to top, rgba(255,255,255,0.95), transparent)",
                                        }}
                                    />

                                    {/* Role badge on photo */}
                                    <div
                                        className="absolute bottom-3 left-4"
                                        style={{
                                            background: member.roleBg,
                                            border: `1px solid ${member.roleBorder}`,
                                            backdropFilter: "blur(8px)",
                                            borderRadius: "100px",
                                            padding: "3px 12px",
                                        }}
                                    >
                                        <span className="text-xs font-semibold" style={{ color: member.roleColor }}>
                                            {member.role}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 flex flex-col flex-1 gap-4">
                                    {/* Name & Icon */}
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-bold" style={{ color: tc.textPri }}>
                                            {member.name}
                                        </h3>
                                        <div
                                            className="w-9 h-9 rounded-xl flex items-center justify-center"
                                            style={{
                                                background: member.roleBg,
                                                border: `1px solid ${member.roleBorder}`,
                                            }}
                                        >
                                            <member.icon className="h-4 w-4" style={{ color: member.roleColor }} />
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p className="text-sm leading-relaxed flex-1" style={{ color: tc.textMuted }}>
                                        {member.description}
                                    </p>

                                    {/* Tech Tags */}
                                    <div className="flex flex-wrap gap-2">
                                        {member.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="text-xs px-2 py-1 rounded-lg font-medium"
                                                style={{
                                                    background: tc.dark ? "rgba(255,255,255,0.07)" : "rgba(30,77,140,0.07)",
                                                    color: tc.textSubtle,
                                                    border: `1px solid ${tc.cardBorder}`,
                                                }}
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Social Links */}
                                    <div
                                        className="flex items-center gap-3 pt-3"
                                        style={{ borderTop: `1px solid ${tc.cardBorder}` }}
                                    >
                                        {[
                                            { href: member.socials.github, Icon: Github, label: "GitHub" },
                                            { href: member.socials.linkedin, Icon: Linkedin, label: "LinkedIn" },
                                            { href: member.socials.email, Icon: Mail, label: "Email" },
                                        ].map(({ href, Icon, label }) => (
                                            <a
                                                key={label}
                                                href={href}
                                                target={href.startsWith("http") ? "_blank" : undefined}
                                                rel="noopener noreferrer"
                                                aria-label={`${member.name} ${label}`}
                                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                                                style={{
                                                    background: tc.dark ? "rgba(255,255,255,0.05)" : "rgba(30,77,140,0.06)",
                                                    border: `1px solid ${tc.cardBorder}`,
                                                    color: tc.textSubtle,
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.color = member.roleColor;
                                                    e.currentTarget.style.borderColor = member.roleColor;
                                                    e.currentTarget.style.background = member.roleBg;
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.color = tc.textSubtle;
                                                    e.currentTarget.style.borderColor = tc.cardBorder;
                                                    e.currentTarget.style.background = tc.dark
                                                        ? "rgba(255,255,255,0.05)"
                                                        : "rgba(30,77,140,0.06)";
                                                }}
                                            >
                                                <Icon className="h-3.5 w-3.5" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-20">
                <div
                    className="absolute left-0 right-0 h-px"
                    style={{ background: "linear-gradient(to right, transparent, rgba(245,166,35,0.3), transparent)" }}
                />
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div
                            className="rounded-3xl p-10"
                            style={{
                                background: tc.dark
                                    ? "linear-gradient(135deg, rgba(30,77,140,0.15), rgba(245,166,35,0.08))"
                                    : "linear-gradient(135deg, rgba(30,77,140,0.07), rgba(245,166,35,0.05))",
                                border: `1px solid ${tc.cardBorder}`,
                            }}
                        >
                            <h2 className="text-3xl font-bold mb-5" style={{ color: tc.textPri }}>
                                Our Mission
                            </h2>
                            <p className="text-base leading-relaxed mb-4" style={{ color: tc.textMuted }}>
                                CivicWatch was born from a simple belief — every citizen deserves a voice in shaping
                                their community. We built this platform as students who saw the gap between civic
                                problems and their solutions.
                            </p>
                            <p className="text-base leading-relaxed" style={{ color: tc.textMuted }}>
                                By combining modern technology with community engagement, we aim to make civic
                                reporting transparent, accessible, and impactful for every neighborhood.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default About;
