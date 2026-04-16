'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function importAIBlogsAction() {
    try {
        await requireAdmin()
        const supabase = await createClient()

        const localizedBlogs = [
            {
                title: 'The Ultimate Guide to Premium Velvet: Mehenga Suit Kharidne Se Pehle Ye 5 Baatein Jaan Len',
                slug: 'premium-velvet-guide-pakistan',
                excerpt: 'Velvet season is here! Discover how to distinguish between high-quality 9000 micro-velvet and cheaper alternatives in the Pakistani market.',
                content: `
                    <div style="background: #FFFBFB; border-left: 5px solid #111; padding: 1.5rem; margin-bottom: 2rem; border-radius: 4px;">
                        <p style="font-size: 1.25rem; color: #4B5563; font-weight: 500; font-style: italic; line-height: 1.6; margin: 0;">
                            "Hawa mein thandak, shaadi ki raunaktien, aur wahi purana sawal...<br/>
                            <strong style="color: #111;">Kaunsa velvet asli hai aur kaunsa plastic?</strong>"
                        </p>
                    </div>
                    <p>Pakistan mein wedding season matlub Velvet season. Lekin bazaar mein aksar log sasta fabric mehengay damon bech dete hain. Habiba Minhas mein hum quality par compromise nahi karte.</p>
                    
                    <h3>1. The Touch Test (Hath Pher Kar Check Karen)</h3>
                    <p>Asli premium velvet hamesha "Soft" aur "Smooth" hota hai. Agar hath pherne par rukhapan (roughness) mahsoos ho, to smajhen usme polyester zyada hai.</p>
                    
                    <h3>2. 9000 Micro Velvet vs Local Stiff Velvet</h3>
                    <p>Hum use karte hain premium 9000 Micro-Velvet jo bhari embroidery ka wazan bhi sambhal leta hai. Sasta velvet embroidery ke niche se phatne lagta hai.</p>
                    
                    <h3>3. The Royal Shine</h3>
                    <p>Asli velvet ki chamak "Aankhon ko chubhti" nahi hai balkay ek royal feel deti hai.</p>
                    
                    <div style="margin: 2rem 0; padding: 1.5rem; background: #f9f9f9; border-radius: 12px; border: 1px solid #eee;">
                        <strong>💡 Expert Tip:</strong> Velvet suit ko hamesha "Dry Clean" karwayen takay uski shine aur soft feel barqarar rahe.
                    </div>
                    
                    <p>Abhi hamari <a href="/shop/category/velvet">Velvet Collection</a> check karen aur apne wedding look ko behtareen banayen.</p>
                `,
                cover_image: 'https://images.unsplash.com/photo-1595777457583-95e059f581ce?q=80&w=1200',
                author_name: 'Habiba Minhas',
                meta_title: 'Premium Velvet Guide for Pakistan: How to Spot Quality',
                meta_description: 'Don\'t get fooled by cheap velvet. Learn 5 ways to identify premium velvet for your next Pakistani wedding outfit.',
                category: 'Style Guides',
                status: 'published'
            },
            {
                title: '5 Trendy Ways to Style Your Wedding Jora in 2026',
                slug: 'style-pakistani-wedding-jora-2026',
                excerpt: 'From heavy shawls to minimalist jewelry, here is how you can stand out in every Barat and Walima event this season.',
                content: `
                    <p>Wedding season mein "Best Dressed" nazar ana har larki ki khwahish hoti hai. Magar style sirf mehengay suit ka naam nahi, balkay usse pehen'ne ke tareeqay ka naam hai.</p>
                    
                    <h3>1. The Heavy Shawl Drape</h3>
                    <p>Agar aapka suit simple raw silk ka hai, to usse ek bhari embroidered velvet shawl ke saath pair karen. Ye look Lahore ki sardi ke liye behtareen hai.</p>
                    
                    <h3>2. Minimalist Jewelry for Maximum Impact</h3>
                    <p>Aaj kal "Less is More" ka trend hai. Sirf ek baray jhumkay ya statement choker hi poore look ko modernize kar sakta hai.</p>
                    
                    <h3>3. The Metallic Footwear Trend</h3>
                    <p>Traditional khussas ki jagah metallic gold ya silver heels try karen, jo aapke ethnic wear ko contemporary touch den gi.</p>
                    
                    <p>Visit our <a href="/shop">Shop</a> to find your next statement piece.</p>
                `,
                cover_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200',
                author_name: 'Habiba Minhas',
                meta_title: '5 Modern Wedding Styling Tips for Pakistanis',
                meta_description: 'Looking for a perfect wedding look? Check out 5 modern ways to style your ethnic jora for this shadi season.',
                category: 'Style Guides',
                status: 'published'
            },
            {
                title: 'Organic Cotton: Why it is the best for your Baby\'s Sensitive Skin',
                slug: 'why-organic-cotton-for-babies-pakistan',
                excerpt: 'Newborn skin is 5 times thinner than adult skin. Learn why choosing organic cotton is crucial for your baby\'s health in Pakistan.',
                content: `
                    <p>Maa bante hi hamari pehli fikar bache ki safety hoti hai. Pakistan mein dhoop aur garmi mein bache ke skin par rashes hona aam baat hai.</p>
                    
                    <h3>1. No Harsh Chemicals</h3>
                    <p>Hamari Baby Collection mein sirf organic cotton use hota hai jis me koi harmful pesticides ya dyes nahi hote.</p>
                    
                    <h3>2. Breathable & Soft</h3>
                    <p>Organic cotton haath lagane mein "Malmal" ki tarah naram hota hai, jo bache ko pur-sukoon neend sula deta hai.</p>
                    
                    <h3>3. Sustainable Quality</h3>
                    <p>Sasta kapra 2-3 dhone ke baad kharab ho jata hai, lekin organic cotton lamba chalta hai aur baar baar dhone se mazeed naram hota hai.</p>
                    
                    <p>Check out our <a href="/shop/category/kids">Kids & Baby Collection</a> for premium comfort.</p>
                `,
                cover_image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=1200',
                author_name: 'Habiba Minhas',
                meta_title: 'Why Organic Cotton for Babies? | Habiba Minhas Kids',
                meta_description: 'Protect your baby\'s sensitive skin with 100% organic cotton. Shop premium handcrafted baby wear in Pakistan.',
                category: 'Baby Care',
                status: 'published'
            }
        ];

        // We use upsert to prevent duplicates based on slug
        const { error } = await supabase
            .from('blog_posts')
            .upsert(localizedBlogs, { onConflict: 'slug' });

        if (error) throw error;

        revalidatePath('/blog');
        revalidatePath('/admin/marketing');
        
        return { success: true, message: '3 Localized Blogs imported successfully!' };

    } catch (error) {
        console.error('Import Error:', error);
        return { success: false, message: error instanceof Error ? error.message : 'Error importing blogs' };
    }
}
