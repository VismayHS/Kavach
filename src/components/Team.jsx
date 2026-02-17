import './Team.css'

const MEMBERS = [
    {
        name: 'Ashwin C H',
        role: 'AI & ML Engineer',
        bio: 'Leading on-device model architecture for distress detection and behavioral analysis.',
        initials: 'AC',
        gradient: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
    },
    {
        name: 'Dhanush S R',
        role: 'Full-Stack Developer',
        bio: 'Architecting the cloud backend, real-time alert system, and mobile integration.',
        initials: 'DS',
        gradient: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
    },
    {
        name: 'Vismay H S',
        role: 'Systems & Security Engineer',
        bio: 'Building privacy-first infrastructure, encryption pipelines, and offline capabilities.',
        initials: 'VH',
        gradient: 'linear-gradient(135deg, #10b981, #06b6d4)',
    },
]

export default function Team() {
    return (
        <section className="section team" id="team">
            <div className="container">
                <div className="team__header reveal">
                    <span className="section-label">Our Team</span>
                    <h2 className="section-title">
                        Built by Team Kavach
                    </h2>
                    <p className="section-subtitle" style={{ margin: '0 auto' }}>
                        Three engineers united by a single mission — making safety
                        technology that is intelligent, private, and accessible to everyone.
                    </p>
                </div>

                <div className="team__grid">
                    {MEMBERS.map((m, i) => (
                        <div key={i} className={`glass-card team__card reveal reveal-delay-${i + 1}`}>
                            <div className="team__avatar" style={{ background: m.gradient }}>
                                {m.initials}
                            </div>
                            <h3 className="team__name">{m.name}</h3>
                            <span className="team__role">{m.role}</span>
                            <p className="team__bio">{m.bio}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
