import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, Facebook, Twitter, HelpCircle, ShieldCheck, Truck, Star } from 'lucide-react';
import { Metadata } from 'next';

// WhatsApp Icon
function PhoneIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
    )
}

// ---------------------------------------------------------
// LOCAL MOCK DATA (With Real Product Mini-Pages & Max FOMO)
// ---------------------------------------------------------
const LOCAL_POSTS = [
    {
        title: 'What to Wear to a Winter Wedding in Pakistan: 5 Simple Ideas',
        slug: 'what-to-wear-on-a-winter-wedding-in-pakistan',
        excerpt: 'Struggling to find the perfect winter wedding outfit? Discover 5 elegant and simple ideas to stay warm without sacrificing your style at Pakistani winter weddings.',
        content: `
        <div style="background: #FFFBFB; border-left: 5px solid #111; padding: 1.5rem; margin-bottom: 2rem; border-radius: 4px;">
            <p style="font-size: 1.25rem; color: #4B5563; font-weight: 500; font-style: italic; line-height: 1.6; margin: 0;">
                Cold हवा (breeze), wedding lights everywhere, and that one frustrating question running through your mind...<br/>
                <strong style="color: #111;">"Kya pehnu ke stylish bhi lagun aur thand bhi na lage?"</strong>
            </p>
        </div>
        
        <p style="line-height: 1.8; margin-bottom: 1.5rem;">We all love attending weddings down here in Pakistan. The rich food, the endless music, and the chance to dress up. But let's be totally honest: getting dressed for a winter wedding is a fashion nightmare.</p>
        <p style="line-height: 1.8; margin-bottom: 2.5rem;">You want to flaunt your gorgeous <a href="/shop?category=ethnic" style="color: #E11D48; text-decoration: underline; font-weight: bold;">ethnic wear</a>, but you also don't want to freeze in the December wind. Most women end up throwing a poorly-matched jacket over their expensive dresses, hiding the embroidery completely.</p>
        
        <p style="line-height: 1.8; margin-bottom: 2rem; font-weight: bold;">But what if you could look stunning <em>and</em> stay cozy? In this guide, we reveal 5 proven ways to dress for a winter wedding in Pakistan without catching a cold.</p>

        <h2 id="velvet-dresses" style="font-size: 1.8rem; font-weight: 800; color: #111; margin-top: 3rem; margin-bottom: 1rem;">1. Invest in Premium Velvet Formals</h2>
        <p style="line-height: 1.8; margin-bottom: 1.5rem;">If there is one magic fabric that rules winter <a href="/shop?category=weddings" style="color: #E11D48; font-weight: 600; text-decoration: underline;">wedding outfits in Pakistan</a>, it is <strong>Velvet</strong>. It is naturally warm, falls beautifully on the body, and gives off a highly royal vibe.</p>
        
        <!-- Style Tip Box -->
        <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 1.5rem; border-radius: 12px; margin-bottom: 2.5rem;">
            <h4 style="font-weight: 800; color: #0F172A; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 1px; margin-bottom: 0.5rem;">💡 Pro Style Tip</h4>
            <p style="margin: 0; color: #475569; font-weight: 500;">Don't scatter your pieces! Pair a dark <a href="/shop?q=velvet-dresses" style="color:#0F172A; text-decoration:underline;">velvet dress</a> with heavy gold kundan jewelry. The contrast creates an unbeatable royal look that needs zero sweaters!</p>
        </div>

        <!-- Embedded Mini-Product Page Inside Blog -->
        <div style="background: white; border: 1px solid #E5E7EB; border-radius: 16px; overflow: hidden; margin-bottom: 3rem; display: flex; flex-direction: column; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); max-width: 450px; margin-left: auto; margin-right: auto;">
            <img src="https://images.unsplash.com/photo-1595777457583-95e059f581ce?q=80&w=600&auto=format&fit=crop" style="width: 100%; height: 400px; object-fit: cover; display: block;" alt="Royal Maroon Velvet Outfit" />
            <div style="padding: 1.5rem; text-align: center; background: #fafafa;">
                <h3 style="font-size: 1.25rem; font-weight: 800; color: #111; margin-bottom: 0.5rem; margin-top: 0;">Royal Maroon Velvet Set</h3>
                <p style="color: #4B5563; font-size: 0.9rem; margin-bottom: 1rem;"><strong style="color:#111;">The Complete Look:</strong> Premium Shirt, Matching Trouser & Heavy Velvet Shawl.</p>
                <div style="display: flex; justify-content: center; gap: 0.5rem; align-items: center; margin-bottom: 1.5rem;">
                    <span style="font-weight: 900; color: #111; font-size: 1.15rem;">PKR 14,500</span>
                    <span style="text-decoration: line-through; color: #9CA3AF; font-size: 0.9rem;">PKR 18,000</span>
                </div>
                <a href="/shop/" style="display: block; width: 100%; background-color: #111; color: white; padding: 14px 0; border-radius: 8px; font-weight: bold; text-decoration: none; text-transform: uppercase; font-size: 0.9rem; transition: opacity 0.2s;">Shop This Full Look →</a>
                <p style="font-size: 0.75rem; color: #E11D48; margin-top: 0.75rem; font-weight: bold;">⚡ Fasting Selling. Only 4 Left.</p>
            </div>
        </div>

        <h2 id="heavy-shawls" style="font-size: 1.8rem; font-weight: 800; color: #111; margin-top: 3rem; margin-bottom: 1rem;">2. Layer Up with an Embroidered Shawl</h2>
        <p style="line-height: 1.8; margin-bottom: 1.5rem;">Drop the lightweight chiffon dupattas that fly away in the cold breeze. Instead, drape a heavy <strong><a href="/shop?category=shawls" style="color: #E11D48; text-decoration: underline; font-weight: bold;">winter shawl</a></strong> over your shoulders.</p>
        <p style="line-height: 1.8; margin-bottom: 2rem;">This single trick turns a simple raw silk suit into a highly traditional, expensive-looking outfit while keeping you perfectly warm through the Walima night.</p>
        
        <!-- Social Proof Snippet -->
        <div style="text-align: center; margin: 2rem auto; font-style: italic; color: #4B5563; font-size: 1rem; padding: 1.5rem; background: #F9FAFB; border-radius: 12px; max-width: 500px; border: 1px solid #E5E7EB;">
            <div style="color: #F59E0B; margin-bottom: 0.5rem;">★★★★★</div>
            "I bought a velvet shawl from Habiba Minhas instead of wearing a jacket. I looked so traditional and didn't feel the 10°C cold at all! Absolutely loved it."<br/>
            <strong style="font-style: normal; display: block; margin-top: 0.5rem;">— Sana Ahmed (Lahore)</strong>
        </div>

        <!-- Consistent Primary CTA -->
        <div style="margin: 2.5rem 0; text-align: center;">
            <a href="/shop/" style="background-color: #111; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block; text-transform: uppercase;">Discover Winter Shawls</a>
        </div>

        <h2 id="day-khaddar" style="font-size: 1.8rem; font-weight: 800; color: #111; margin-top: 3rem; margin-bottom: 1rem;">3. Formal Khaddar for Daytime Events</h2>
        <p style="line-height: 1.8; margin-bottom: 1.5rem;">Wearing <a href="/shop?category=velvet" style="color: #111; font-weight: 600; text-decoration: underline;">heavy velvet dresses</a> under the bright afternoon sun for a daytime Nikah might feel sweaty.</p>
        <p style="line-height: 1.8; margin-bottom: 2rem;">This is where <strong>formal khaddar</strong> steps in. With subtle tilla work or a block-printed shawl, khaddar is breathable yet perfectly cozy.</p>

        <!-- Product Visual -->
        <div style="background: white; border: 1px solid #E5E7EB; border-radius: 16px; overflow: hidden; margin-bottom: 3rem; display: flex; flex-direction: column; align-items: stretch; max-width: 400px; margin-left: auto; margin-right: auto; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);">
            <img src="https://images.unsplash.com/photo-1601550992336-7c0b05b5f884?q=80&w=400&auto=format&fit=crop" style="width: 100%; height: 300px; object-fit: cover;" alt="Embroidered Khaddar Setup" />
            <div style="padding: 1.5rem; text-align: center;">
                <h3 style="font-size: 1.15rem; font-weight: bold; color: #111; margin-bottom: 1rem; margin-top: 0;">2-Piece Embroidered Khaddar</h3>
                <a href="/shop/" style="display: block; width: 100%; background-color: #111; color: white; padding: 12px 0; border-radius: 8px; font-weight: bold; text-decoration: none; text-transform: uppercase; font-size: 0.9rem;">Add to Cart - PKR 6,500</a>
            </div>
        </div>

        <h2 id="layering-capes" style="font-size: 1.8rem; font-weight: 800; color: #111; margin-top: 3rem; margin-bottom: 1rem;">4. Elegant Gowns and Long Jackets</h2>
        <p style="line-height: 1.8; margin-bottom: 1.5rem;">The modern Pakistani fashion scene is obsessed with layering. Instead of a traditional short kameez, opt for a long, front-open <strong>cape or jacket</strong> worn over an inner suit.</p>
        
        <!-- Style Tip Box -->
        <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem;">
            <h4 style="font-weight: 800; color: #0F172A; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 1px; margin-bottom: 0.5rem;">💡 Layering Tip</h4>
            <p style="margin: 0; color: #475569; font-weight: 500;">When made from thick raw silk, long jackets act as stylish overcoats that seamlessly blend with your ethnic aesthetic. You get maximum warmth without ruining your look with an oversized cardigan.</p>
        </div>

        <h2 id="colors" style="font-size: 1.8rem; font-weight: 800; color: #111; margin-top: 3rem; margin-bottom: 1rem;">5. Play with Deep, Rich Colors</h2>
        <p style="line-height: 1.8; margin-bottom: 1.5rem;">Winter fashion demands deep, rich tones. Colors psychologically radiate warmth and absorb heat from the winter sun.</p>
        <ul style="margin-bottom: 2.5rem; padding-left: 1.5rem; line-height: 1.8; font-weight: 500;">
            <li><strong>Daytime Hits:</strong> Mustard, Rust, and Olive Green.</li>
            <li><strong>Nighttime Classics:</strong> Black, Plum, and Deep Reds.</li>
        </ul>

        <h2 id="faq" style="font-size: 2rem; font-weight: 800; color: #111; margin-top: 4rem; margin-bottom: 1.5rem; border-bottom: 2px solid #E5E7EB; padding-bottom: 0.5rem;">FAQs About Winter Wedding Outfits in Pakistan</h2>
        
        <div style="margin-bottom: 3rem;">
            <details style="margin-bottom: 1rem; border: 1px solid #E5E7EB; border-radius: 12px; background: white; overflow: hidden;">
                <summary style="font-weight: 800; font-size: 1.1rem; color: #111; padding: 1.2rem; background: #F9FAFB; cursor: pointer; display: list-item; outline: none; transition: background 0.2s;">
                    What colors are best for winter weddings in Pakistan?
                </summary>
                <div style="padding: 1.2rem; color: #4B5563; line-height: 1.6; border-top: 1px solid #E5E7EB;">
                    Dark and jewel tones look most elegant in winter. Think emerald green, maroon, deep plum, and classic black. Pastel colors should generally be avoided unless it's a daytime event.
                </div>
            </details>

            <details style="margin-bottom: 1rem; border: 1px solid #E5E7EB; border-radius: 12px; background: white; overflow: hidden;">
                <summary style="font-weight: 800; font-size: 1.1rem; color: #111; padding: 1.2rem; background: #F9FAFB; cursor: pointer; display: list-item; outline: none; transition: background 0.2s;">
                    Can I wear chiffon in winter?
                </summary>
                <div style="padding: 1.2rem; color: #4B5563; line-height: 1.6; border-top: 1px solid #E5E7EB;">
                    You can, but it provides zero insulation. If you insist on wearing a chiffon or lawn outfit, make sure you pair it with a very thick thermal inner layer and a heavy velvet shawl to block the cold.
                </div>
            </details>

            <details style="margin-bottom: 1rem; border: 1px solid #E5E7EB; border-radius: 12px; background: white; overflow: hidden;">
                <summary style="font-weight: 800; font-size: 1.1rem; color: #111; padding: 1.2rem; background: #F9FAFB; cursor: pointer; display: list-item; outline: none; transition: background 0.2s;">
                    What shoes to wear to winter weddings?
                </summary>
                <div style="padding: 1.2rem; color: #4B5563; line-height: 1.6; border-top: 1px solid #E5E7EB;">
                    Avoid open-toe sandals. Opt for embellished Khussas, closed pumps, or elegant velvet block heels. They keep your feet warm and match the traditional aesthetic perfectly.
                </div>
            </details>

            <details style="margin-bottom: 1rem; border: 1px solid #E5E7EB; border-radius: 12px; background: white; overflow: hidden;">
                <summary style="font-weight: 800; font-size: 1.1rem; color: #111; padding: 1.2rem; background: #F9FAFB; cursor: pointer; display: list-item; outline: none; transition: background 0.2s;">
                    What's the difference between day vs night winter outfits?
                </summary>
                <div style="padding: 1.2rem; color: #4B5563; line-height: 1.6; border-top: 1px solid #E5E7EB;">
                    Daytime events allow for breathable fabrics like formal khaddar or raw silk in lighter, sun-reflective colors (mustard, rust). Nighttime events demand heavy velvet and deeply saturated tones to battle the massive temperature drop.
                </div>
            </details>
        </div>
        `,
        cover_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop',
        author: {
            name: "Aisha Malik",
            role: "Fashion Editor at Habiba Minhas",
            image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
            bio: "Aisha helps Pakistani women discover their elegance through high-quality, handcrafted ethnic fashion."
        },
        meta_title: 'What to Wear to a Winter Wedding in Pakistan: 5 Simple Ideas',
        meta_description: 'Struggling with what to wear on a winter wedding in Pakistan? Follow these 5 fashion ideas to stay warm, look premium, and avoid style mistakes.',
        keywords: ['velvet dresses', 'winter shawls', 'wedding wear', 'winter collection', 'Pakistani winter fashion'],
        category: 'Style Guides',
        reading_time: '6 Min Read',
        status: 'published',
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    }
];

const RELATED_POSTS = [
    { title: "5 Winter Outfit Mistakes You MUST Avoid", slug: "winter-outfit-mistakes", image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=400&fit=crop" },
    { title: "Best Colors for Winter Weddings in Pakistan", slug: "best-winter-wedding-colors", image: "https://images.unsplash.com/photo-1601550992336-7c0b05b5f884?q=80&w=400&fit=crop" },
    { title: "How to Style a Shawl Like a Celebrity in 2026", slug: "shawl-styling-guide", image: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=400&fit=crop" },
]

// ─── EXTRA BLOG POSTS (fixes 404s for related post links) ───────────────────

LOCAL_POSTS.push(
    {
        title: '5 Winter Outfit Mistakes Pakistani Women Must Avoid',
        slug: 'winter-outfit-mistakes',
        excerpt: 'Are you unknowingly making these 5 fashion mistakes at winter weddings? Find out how to fix them and look absolutely stunning this season.',
        content: `
        <div style="background: #FFFBFB; border-left: 5px solid #111; padding: 1.5rem; margin-bottom: 2rem; border-radius: 4px;">
            <p style="font-size: 1.25rem; color: #4B5563; font-weight: 500; font-style: italic; line-height: 1.6; margin: 0;">
                You spent hours getting ready, but something still feels <strong style="color: #111;">off</strong>.<br/>
                Chances are, you made one of <strong>these 5 classic mistakes.</strong>
            </p>
        </div>

        <p style="line-height: 1.8; margin-bottom: 1.5rem;">Winter weddings are magical — the fairy lights, the music, the gorgeous food. But they are also where most women unknowingly commit fashion crimes that ruin an otherwise perfect look.</p>
        <p style="line-height: 1.8; margin-bottom: 2.5rem;">Whether it's a mismatch of fabrics or the wrong shade of lipstick for a cold December night, these mistakes are more common than you think. Here are the top 5 you need to avoid.</p>

        <h2 id="mistake-1" style="font-size: 1.8rem; font-weight: 800; color: #111; margin-top: 3rem; margin-bottom: 1rem;">1. Wearing Chiffon Without Layering</h2>
        <p style="line-height: 1.8; margin-bottom: 2rem;">Chiffon is breathtaking — but in winter, it's practically invisible armour against the cold. If you insist on chiffon, layer a thermal inner underneath and pair it with a heavy <a href="/shop?category=shawls" style="color:#E11D48; font-weight:bold; text-decoration:underline;">velvet shawl</a> on top.</p>

        <h2 id="mistake-2" style="font-size: 1.8rem; font-weight: 800; color: #111; margin-top: 3rem; margin-bottom: 1rem;">2. Wearing Light Pastel Colors at Night Events</h2>
        <p style="line-height: 1.8; margin-bottom: 2rem;">Baby pinks and sky blues disappear under wedding hall lighting at night. Opt for jewel tones — emerald, plum, deep maroon — that photograph beautifully and radiate warmth and elegance.</p>

        <h2 id="mistake-3" style="font-size: 1.8rem; font-weight: 800; color: #111; margin-top: 3rem; margin-bottom: 1rem;">3. Throwing On an Ugly Sweater Over Your Dress</h2>
        <p style="line-height: 1.8; margin-bottom: 2rem;">This is the number one crime at Pakistani winter weddings. A random cardigan destroys your embroidery and silhouette completely. Instead, switch to a <a href="/shop?category=velvet" style="color:#E11D48; font-weight:bold; text-decoration:underline;">velvet dress</a> or a structured cape that is both warm AND beautiful.</p>

        <h2 id="mistake-4" style="font-size: 1.8rem; font-weight: 800; color: #111; margin-top: 3rem; margin-bottom: 1rem;">4. Wearing Open-Toe Sandals in December</h2>
        <p style="line-height: 1.8; margin-bottom: 2rem;">Open heels and cold marble floors are not friends. Switch to embellished Khussas, closed velvet pumps, or block heels. Your feet will thank you — and so will your overall look.</p>

        <h2 id="mistake-5" style="font-size: 1.8rem; font-weight: 800; color: #111; margin-top: 3rem; margin-bottom: 1rem;">5. Ignoring Jewellery Layering</h2>
        <p style="line-height: 1.8; margin-bottom: 2rem;">In summer, minimal jewellery looks chic. In winter, it looks unfinished. Layer your earrings with a statement necklace or a maang tikka. The extra pieces add warmth to your look without adding actual fabric.</p>

        <h2 id="faq" style="font-size: 2rem; font-weight: 800; color: #111; margin-top: 4rem; margin-bottom: 1.5rem; border-bottom: 2px solid #E5E7EB; padding-bottom: 0.5rem;">Frequently Asked Questions</h2>
        <div style="margin-bottom: 3rem;">
            <details style="margin-bottom: 1rem; border: 1px solid #E5E7EB; border-radius: 12px; background: white; overflow: hidden;">
                <summary style="font-weight: 800; font-size: 1.1rem; color: #111; padding: 1.2rem; background: #F9FAFB; cursor: pointer;">Can I wear a lawn suit to a winter wedding?</summary>
                <div style="padding: 1.2rem; color: #4B5563; line-height: 1.6; border-top: 1px solid #E5E7EB;">It is not recommended. Lawn provides zero warmth. If you must, pair it with thermal undergarments and a very thick embroidered shawl.</div>
            </details>
            <details style="margin-bottom: 1rem; border: 1px solid #E5E7EB; border-radius: 12px; background: white; overflow: hidden;">
                <summary style="font-weight: 800; font-size: 1.1rem; color: #111; padding: 1.2rem; background: #F9FAFB; cursor: pointer;">What is the best fabric to stay warm at a wedding?</summary>
                <div style="padding: 1.2rem; color: #4B5563; line-height: 1.6; border-top: 1px solid #E5E7EB;">Velvet is the undisputed queen of winter wedding fabrics. It's warm, luxurious-looking, and comes in beautiful deep colors. Pashmina and raw silk are great alternatives.</div>
            </details>
        </div>
        `,
        cover_image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=1200&auto=format&fit=crop',
        author: {
            name: "Aisha Malik",
            role: "Fashion Editor at Habiba Minhas",
            image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
            bio: "Aisha helps Pakistani women discover their elegance through high-quality, handcrafted ethnic fashion."
        },
        meta_title: '5 Winter Outfit Mistakes Pakistani Women Must Avoid',
        meta_description: 'Are you unknowingly making these common winter fashion mistakes? Discover 5 things to avoid and look stunning at every winter wedding in Pakistan.',
        keywords: ['winter outfit mistakes', 'pakistani wedding fashion', 'velvet wear', 'winter wedding tips', 'Pakistani ethnic wear'],
        category: 'Style Guides',
        reading_time: '5 Min Read',
        status: 'published',
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        title: 'Best Colors for Winter Weddings in Pakistan: A Complete Guide',
        slug: 'best-winter-wedding-colors',
        excerpt: 'Not sure which colors work best for winter weddings in Pakistan? This complete color guide breaks down the best shades for day and night events.',
        content: `
        <div style="background: #FFFBFB; border-left: 5px solid #111; padding: 1.5rem; margin-bottom: 2rem; border-radius: 4px;">
            <p style="font-size: 1.25rem; color: #4B5563; font-weight: 500; font-style: italic; line-height: 1.6; margin: 0;">
                Color is more than fashion — it is <strong style="color:#111;">emotion, warmth, and presence.</strong><br/>
                Choose the right one and the whole room will notice you.
            </p>
        </div>

        <p style="line-height: 1.8; margin-bottom: 1.5rem;">One of the biggest decisions when dressing for a winter wedding is: <strong>what color do I wear?</strong> Get it right and you look confident, polished, and camera-ready. Get it wrong and you fade into the background — or worse, look out of season.</p>

        <h2 id="night-colors" style="font-size: 1.8rem; font-weight: 800; color: #111; margin-top: 3rem; margin-bottom: 1rem;">Best Colors for Night Events (Barat & Walima)</h2>
        <p style="line-height: 1.8; margin-bottom: 1rem;">Night functions demand rich, saturated tones that pop under hall lighting and in photographs.</p>
        <ul style="margin-bottom: 2.5rem; padding-left: 1.5rem; line-height: 2; font-weight: 500;">
            <li><strong>Deep Maroon</strong> — classic, powerful, universally flattering</li>
            <li><strong>Emerald Green</strong> — fresh yet deep, especially on velvet</li>
            <li><strong>Navy Blue</strong> — sophisticated and rare at Pakistani weddings (stand out!)</li>
            <li><strong>Plum / Deep Purple</strong> — mysterious and highly photogenic</li>
            <li><strong>Classic Black</strong> — bold and modern, pair with gold jewellery</li>
        </ul>

        <h2 id="day-colors" style="font-size: 1.8rem; font-weight: 800; color: #111; margin-top: 3rem; margin-bottom: 1rem;">Best Colors for Daytime Events (Nikah & Mehndi)</h2>
        <p style="line-height: 1.8; margin-bottom: 1rem;">Daytime winter events happen under natural sunlight, so slightly warmer, lighter tones work beautifully.</p>
        <ul style="margin-bottom: 2.5rem; padding-left: 1.5rem; line-height: 2; font-weight: 500;">
            <li><strong>Mustard Yellow</strong> — warm, bright, and deeply cultural</li>
            <li><strong>Rust / Burnt Orange</strong> — earthy and bold under daylight</li>
            <li><strong>Olive Green</strong> — understated and elegant</li>
            <li><strong>Dusty Rose</strong> — soft but richer than baby pink</li>
        </ul>

        <h2 id="colors-to-avoid" style="font-size: 1.8rem; font-weight: 800; color: #111; margin-top: 3rem; margin-bottom: 1rem;">Colors to Avoid in Winter</h2>
        <ul style="margin-bottom: 2.5rem; padding-left: 1.5rem; line-height: 2; font-weight: 500; color: #6B7280;">
            <li>❌ <strong>White</strong> — reserved for the bride in many Pakistani traditions</li>
            <li>❌ <strong>Baby Pink / Sky Blue</strong> — too washed out under artificial lighting</li>
            <li>❌ <strong>Neon Colors</strong> — clash with the warm, intimate ambience of winter events</li>
        </ul>

        <h2 id="faq" style="font-size: 2rem; font-weight: 800; color: #111; margin-top: 4rem; margin-bottom: 1.5rem; border-bottom: 2px solid #E5E7EB; padding-bottom: 0.5rem;">Frequently Asked Questions</h2>
        <div style="margin-bottom: 3rem;">
            <details style="margin-bottom: 1rem; border: 1px solid #E5E7EB; border-radius: 12px; background: white; overflow: hidden;">
                <summary style="font-weight: 800; font-size: 1.1rem; color: #111; padding: 1.2rem; background: #F9FAFB; cursor: pointer;">Can I wear white to a Pakistani wedding?</summary>
                <div style="padding: 1.2rem; color: #4B5563; line-height: 1.6; border-top: 1px solid #E5E7EB;">It is traditionally avoided in Pakistan as white is associated with mourning in South Asian cultures. Stick to rich, warm tones to respect this tradition.</div>
            </details>
            <details style="margin-bottom: 1rem; border: 1px solid #E5E7EB; border-radius: 12px; background: white; overflow: hidden;">
                <summary style="font-weight: 800; font-size: 1.1rem; color: #111; padding: 1.2rem; background: #F9FAFB; cursor: pointer;">What color is most popular at Pakistani winter weddings?</summary>
                <div style="padding: 1.2rem; color: #4B5563; line-height: 1.6; border-top: 1px solid #E5E7EB;">Deep maroon and emerald green consistently dominate Pakistani winter wedding fashion. They look stunning in photos and pair beautifully with gold jewellery.</div>
            </details>
        </div>
        `,
        cover_image: 'https://images.unsplash.com/photo-1601550992336-7c0b05b5f884?q=80&w=1200&auto=format&fit=crop',
        author: {
            name: "Aisha Malik",
            role: "Fashion Editor at Habiba Minhas",
            image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
            bio: "Aisha helps Pakistani women discover their elegance through high-quality, handcrafted ethnic fashion."
        },
        meta_title: 'Best Colors for Winter Weddings in Pakistan: A Complete Color Guide',
        meta_description: 'Discover the best colors to wear to a winter wedding in Pakistan. From maroon to emerald green, find the perfect shade for day and night events.',
        keywords: ['winter wedding colors', 'pakistani fashion colors', 'velvet colors', 'wedding guest colors pakistan', 'winter color palette'],
        category: 'Style Guides',
        reading_time: '4 Min Read',
        status: 'published',
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    }
);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const post = LOCAL_POSTS.find(p => p.slug === slug);
    if (!post) return { title: 'Not Found' };

    return {
        title: post.meta_title,
        description: post.meta_description,
        keywords: post.keywords?.join(', '),
        alternates: { canonical: `https://habibaminhas.com/blog/${slug}/` },
        openGraph: { images: post.cover_image ? [post.cover_image] : [] }
    };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = LOCAL_POSTS.find(p => p.slug === slug && p.status === 'published');

    if (!post) notFound();

    const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        '@id': `https://habibaminhas.com/blog/${post.slug}/#article`,
        headline: post.title,
        image: post.cover_image,
        datePublished: post.published_at,
        dateModified: post.updated_at,
        author: {
            '@type': 'Person',
            '@id': 'https://habibaminhas.com/#founder', // Linking to the founder entity
            name: post.author.name === 'Habiba Minhas' ? 'Habiba Minhas' : post.author.name,
        },
        publisher: {
            '@type': 'Organization',
            '@id': 'https://habibaminhas.com/#organization', // Linking to the organization entity
            name: 'Habiba Minhas',
            logo: {
                '@type': 'ImageObject',
                url: 'https://habibaminhas.com/logo.png',
            },
        },
        description: post.meta_description,
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://habibaminhas.com/blog/${post.slug}/`,
        },
    };

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [{
        "@type": "Question",
        "name": "What colors are best for winter weddings in Pakistan?",
        "acceptedAnswer": { "@type": "Answer", "text": "Dark and jewel tones look most elegant in winter. Think emerald green, maroon, deep plum, and classic black." }
      }, {
        "@type": "Question",
        "name": "Can I wear chiffon in winter?",
        "acceptedAnswer": { "@type": "Answer", "text": "You can, but it provides zero insulation. Pair it with a very thick thermal inner layer and a heavy velvet shawl to block the cold." }
      }, {
        "@type": "Question",
        "name": "What shoes to wear to winter weddings?",
        "acceptedAnswer": { "@type": "Answer", "text": "Avoid open-toe sandals. Opt for embellished Khussas, closed pumps, or elegant velvet block heels." }
      }, {
        "@type": "Question",
        "name": "What's the difference between day vs night winter outfits?",
        "acceptedAnswer": { "@type": "Answer", "text": "Daytime events allow for breathable fabrics like formal khaddar or raw silk in lighter, sun-reflective colors. Nighttime events demand heavy velvet and deeply saturated tones." }
      }]
    }

    return (
        <main className="bg-white min-h-screen font-body relative overflow-x-hidden w-full max-w-[100vw]">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

            {/* Sticky Mobile CTA Bottom Bar (High Urgency) */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-50 text-center shadow-[0_-4px_10px_0px_rgba(0,0,0,0.1)]">
                <Link href="/shop/" className="w-full flex items-center justify-center gap-2 bg-primary text-white font-black py-4 rounded-xl uppercase tracking-widest text-sm shadow-md transition-opacity hover:opacity-90">
                    Explore Winter Collection
                </Link>
            </div>

            {/* VASTLY IMPROVED Split Hero Variant */}
            <div className="w-full flex flex-col md:flex-row min-h-[60vh] border-b border-gray-100 items-stretch bg-gray-50">
                <div className="flex-1 flex flex-col justify-center p-8 md:p-16 lg:p-24 z-10 w-full">
                    
                    {/* Visual UI Breadcrumbs */}
                    <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 mb-8 w-full overflow-hidden whitespace-nowrap">
                        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                        <span>/</span>
                        <Link href="/blog/" className="hover:text-primary transition-colors">Journal</Link>
                        <span>/</span>
                        <span className="text-primary truncate max-w-[120px] sm:max-w-xs">{post.title}</span>
                    </nav>

                    <div className="flex items-center gap-3 mb-6 flex-wrap">
                        <span className="bg-primary text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm">
                            {post.category}
                        </span>
                        <span className="bg-white border border-gray-200 text-gray-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm flex items-center gap-2">
                             ⏱ {post.reading_time || '5 Min Read'}
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-5xl break-words font-heading font-black text-gray-900 mb-6 leading-[1.1] tracking-tight">
                        {post.title}
                    </h1>
                    <div className="flex items-center gap-4 text-gray-600 text-sm font-medium mt-4">
                        <Image src={post.author.image} alt={post.author.name} width={48} height={48} className="rounded-full object-cover shadow-sm border-2 border-white" unoptimized/>
                        <div>
                            <p className="text-gray-900 font-bold text-base">{post.author.name}</p>
                            <p className="text-xs uppercase tracking-wider mt-0.5">{new Date(post.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                    </div>
                </div>
                {/* Right Hero Image Collage/Full Outfit - High Quality Visual */}
                <div className="flex-1 relative min-h-[400px] md:min-h-full overflow-hidden">
                    {post.cover_image && (
                        <Image src={post.cover_image} alt={post.title} fill className="object-cover object-top scale-105" priority unoptimized />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-50 via-gray-50/20 to-transparent md:w-32 hidden md:block"></div>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-7xl py-12 md:py-20 flex flex-col lg:flex-row gap-12 lg:gap-16">
                
                {/* Main Content Column */}
                <div className="flex-1 max-w-4xl order-2 lg:order-1">
                    
                    {/* Floating Social Share Inline for Mobile */}
                    <div className="flex gap-4 mb-10 pb-10 border-b border-gray-200 lg:hidden">
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2 w-full text-center hidden">Share This Look</p>
                        <button className="flex-1 flex flex-col items-center justify-center gap-2 py-4 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors rounded-2xl border border-[#25D366]/20 font-bold shadow-sm">
                            <PhoneIcon className="w-8 h-8"/> WhatsApp
                        </button>
                        <button className="flex-1 flex flex-col items-center justify-center gap-2 py-4 bg-gray-50 text-gray-800 hover:bg-gray-800 hover:text-white transition-colors rounded-2xl border border-gray-200 font-bold shadow-sm">
                            <Facebook className="w-8 h-8"/> Facebook
                        </button>
                    </div>

                    {/* Highly Visual Table of Contents */}
                    <nav className="bg-white border-2 border-gray-100 p-8 rounded-[2rem] mb-12 shadow-md hover:shadow-lg transition-shadow">
                        <h2 className="font-heading font-black text-2xl mb-6 text-gray-900 flex items-center gap-3">
                            <span className="bg-gray-100 text-gray-900 p-3 rounded-xl"><HelpCircle className="w-6 h-6"/></span>
                            Quick Jump Guide
                        </h2>
                        <ul className="space-y-5 text-base text-gray-700 font-bold">
                            <li className="flex items-center gap-4"><span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">1</span><a href="#velvet-dresses" className="hover:text-primary transition-colors underline decoration-gray-200 underline-offset-8">Premium Velvet Ethnic Wear</a></li>
                            <li className="flex items-center gap-4"><span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">2</span><a href="#heavy-shawls" className="hover:text-primary transition-colors underline decoration-gray-200 underline-offset-8">Embroidered Shawls</a></li>
                            <li className="flex items-center gap-4"><span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">3</span><a href="#day-khaddar" className="hover:text-primary transition-colors underline decoration-gray-200 underline-offset-8">Formal Khaddar for Daytime</a></li>
                            <li className="flex items-center gap-4"><span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">4</span><a href="#layering-capes" className="hover:text-primary transition-colors underline decoration-gray-200 underline-offset-8">Gowns and Long Jackets</a></li>
                            <li className="flex items-center gap-4 mt-6 pt-6 border-t border-gray-100"><a href="#faq" className="text-primary hover:text-primary/70 transition-colors">Read Frequently Asked Questions ↓</a></li>
                        </ul>
                    </nav>

                    {/* Main HTML Body */}
                    <div
                        className="font-body text-gray-800 text-base md:text-lg overflow-wrap-break-word break-words"
                        dangerouslySetInnerHTML={{ __html: post.content || '' }}
                    />

                    {/* Tags as Internal Links (Aggressive SEO Linking) */}
                    {post.keywords && (
                        <div className="mt-16 pt-10 border-t-2 border-gray-100 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                            <span className="font-black text-sm text-gray-900 uppercase tracking-widest w-full sm:w-auto">Explore Topics:</span>
                            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                                {post.keywords.map((tag: string) => (
                                    <Link href={`/shop?q=${tag.replace(/ /g, '-')}`} key={tag} className="bg-gray-100 border border-gray-200 hover:bg-black hover:text-white transition-colors text-gray-700 px-5 py-2.5 rounded-full text-xs font-bold tracking-wide shadow-sm">
                                        #{tag}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Highly Converting Lead Generation Box (Newsletter) */}
                    <div className="mt-16 bg-gray-900 rounded-[2rem] p-10 text-center relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[80px] rounded-full"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full"></div>
                        <h2 className="font-heading font-black text-3xl text-white mb-3 relative z-10">Get 10% Off Your Next Look</h2>
                        <p className="text-gray-300 text-lg mb-8 max-w-md mx-auto relative z-10">Join 15,000+ fashion lovers. Get exclusive style guides and VIP secret sales delivered to your inbox.</p>
                        <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto relative z-10">
                            <input type="email" placeholder="Enter your email address" className="flex-1 px-6 py-4 rounded-xl text-gray-900 border-none outline-none focus:ring-2 focus:ring-primary shadow-inner font-medium" />
                            <button type="button" className="bg-primary hover:bg-primary/90 text-white font-black px-8 py-4 rounded-xl uppercase tracking-widest text-sm shadow-lg transition-transform hover:scale-105 active:scale-95">
                                Send My Code
                            </button>
                        </form>
                    </div>

                    {/* Authority Author Box */}
                    <div className="mt-16 p-8 md:p-12 bg-white rounded-[2rem] border-2 border-gray-100 shadow-xl flex flex-col md:flex-row items-center md:items-start gap-8 text-center md:text-left hover:border-gray-300 transition-colors">
                        <div className="w-28 h-28 relative flex-shrink-0">
                            <Image src={post.author.image} alt={post.author.name} fill className="rounded-full object-cover shadow-lg border-4 border-gray-50" unoptimized/>
                        </div>
                        <div>
                            <h3 className="font-heading font-black text-3xl text-gray-900">{post.author.name}</h3>
                            <p className="text-xs uppercase tracking-widest text-[#E11D48] font-black mb-4 mt-1">{post.author.role}</p>
                            <p className="text-gray-600 text-[1.05rem] leading-relaxed">{post.author.bio}</p>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar (Urgent & Sticky) */}
                <aside className="w-full lg:w-96 flex-shrink-0 order-1 lg:order-2 space-y-10">
                    
                    {/* Share Widget for Desktop */}
                    <div className="hidden lg:block bg-[#25D366] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                        <a href="https://api.whatsapp.com/send?text=Check%20out%20this%20winter%20wedding%20style%20guide!" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 p-5 text-white font-black text-lg tracking-wide">
                            <PhoneIcon className="w-7 h-7" /> Share to WhatsApp
                        </a>
                    </div>

                    {/* Widget: Trending Winter Picks with EXTREME Urgency */}
                    <div className="bg-white border-2 border-primary rounded-3xl p-6 lg:p-8 shadow-2xl relative sticky top-8">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white font-black tracking-widest uppercase text-[10px] px-6 py-2 rounded-full whitespace-nowrap shadow-md">
                            Selling Fast
                        </div>
                        <h2 className="font-heading font-black text-2xl text-gray-900 mb-8 mt-2 text-center">
                            Limited Winter Collection
                        </h2>
                        
                        <div className="space-y-6 mb-8">
                            <a href="/shop" className="flex gap-4 items-center group cursor-pointer border-b border-gray-100 pb-6">
                                <div className="w-24 h-24 bg-gray-100 rounded-2xl overflow-hidden relative border border-gray-200 flex-shrink-0">
                                    <Image src="https://images.unsplash.com/photo-1595777457583-95e059f581ce?q=80&w=200&fit=crop" fill className="object-cover group-hover:scale-110 transition-transform duration-500" alt="Velvet suit" unoptimized/>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-base font-black text-gray-900 leading-snug group-hover:text-primary transition-colors">Royal Maroon Formal Set</h3>
                                    <div className="flex items-center gap-2 mt-2">
                                        <p className="text-base font-black text-gray-900">Rs 14,500</p>
                                    </div>
                                    <p className="text-[11px] text-[#E11D48] bg-red-50 inline-block px-2 py-0.5 rounded font-black mt-2">🔥 Only 3 left in stock!</p>
                                </div>
                            </a>
                            
                            <a href="/shop" className="flex gap-4 items-center group cursor-pointer">
                                <div className="w-24 h-24 bg-gray-100 rounded-2xl overflow-hidden relative border border-gray-200 flex-shrink-0">
                                    <Image src="https://images.unsplash.com/photo-1601550992336-7c0b05b5f884?q=80&w=200&fit=crop" fill className="object-cover group-hover:scale-110 transition-transform duration-500" alt="Shawl" unoptimized/>
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-base font-black text-gray-900 leading-snug group-hover:text-primary transition-colors">Premium Winter Shawl</h4>
                                    <div className="flex items-center gap-2 mt-2">
                                        <p className="text-base font-black text-gray-900">Rs 8,900</p>
                                        <p className="text-xs text-gray-400 line-through">Rs 11,000</p>
                                    </div>
                                </div>
                            </a>
                        </div>

                        <Link href="/shop?category=winter-collection" className="flex items-center justify-center w-full bg-primary text-white py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:opacity-90 transition-all shadow-lg animate-pulse">
                            Secure Your Outfit
                        </Link>
                    </div>
                </aside>
            </div>

            {/* HIGH CURIOSITY Related Posts Section */}
            <div className="bg-gray-50 py-20 lg:py-24 border-t border-gray-200 pb-32 lg:pb-24">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="mb-14 text-center">
                        <h2 className="text-3xl md:text-4xl font-heading font-black text-gray-900 mb-4">Don't Miss These Crucial Tips</h2>
                        <div className="w-24 h-1.5 bg-primary mx-auto rounded-full"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {RELATED_POSTS.map(rp => (
                            <Link href={`/blog/${rp.slug}/`} key={rp.slug} className="group block bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                                <div className="h-64 w-full relative bg-gray-200">
                                    <Image src={rp.image} alt={rp.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" unoptimized/>
                                </div>
                                <div className="p-8">
                                    <h3 className="font-heading font-black text-xl text-gray-900 group-hover:text-primary transition-colors leading-[1.3]">
                                        {rp.title}
                                    </h3>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
