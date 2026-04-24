  export const dynamic = "force-dynamic"                                                                                          
  import { getSession } from '@/lib/auth'                                                                                         
  import { prisma } from '@/lib/prisma'                                                                                           
  import { ok, forbidden, unauthorized, serverError } from '@/lib/apiHelpers'                                                     
                                                                                                                                  
  // GET /api/gigs/pending — admin only: list all PENDING_REVIEW gigs                                                             
  export async function GET() {                                                                                                   
    try {                                                                                                                         
      const session = await getSession()                                                                                          
      if (!session) return unauthorized()                                                                                         
      if (session.role !== 'ADMIN') return forbidden()                                                                            
                                                                                                                                  
      const gigs = await prisma.gig.findMany({                                                                                    
        where: { status: 'PENDING_REVIEW' },                                                                                      
        include: {                                                                                                                
          seller: { select: { id: true, name: true, email: true, sellerBio: true, skills: true } },                               
        },                                                                                                                        
        orderBy: { createdAt: 'asc' },                                                                                            
      })                                                                                                                          
                                                                                                                                  
      return ok({ gigs })                                                                                                         
    } catch (e) { 
      return serverError(e instanceof Error ? e.message : String(e))                                                              
    }                                                                                                                             
  }    
