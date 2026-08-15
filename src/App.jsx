import { useEffect, useRef, useState } from 'react'
import Matter from 'matter-js'
import { motion, AnimatePresence } from 'framer-motion'
import './App.css'

function escapeHtml(str) {
  if (str == null) return ''
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

// Book list at module level so edits (e.g. author) trigger scene rebuild when the file is saved/HMR
// bodyText: array of paragraphs (variable length), each string is one <p>
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

// Reference viewport width the book xOffsets were designed for; positions scale with viewport so books stay in scene
const REFERENCE_VIEWPORT_WIDTH = 1200
const BOOK_SPAWN_X_MARGIN = 80
const SPAWN_LEFT_OFFSET = 200 // nudge all body spawn points slightly left

const IMAGE_BOOKS = [
  {
    month: 1,
    image: './blue-light-hours.jpg',
    xOffset: 100,
    y: 150,
    scale: 0.3,
    restitution: 0.8,
    hoverText: 'Blue Light Hours',
    author: 'Bruna Dantas Lobato',
    bodyText: [
      'An incredibly pleasant read. The central theme never really changes, the back and forth connection between a unnamed mother in Brazil and her unnamed daughter attending college in Vermont as an exchange student. Both mother and daughter, illuminated in the glow of their Skype calls, telling each other about anything they can, as if they would never be able to tell it again to anyone else.',
      'It made me stop and think about how observant I am about my own everyday life. I have long distance relationships to maintain myself (my family, my partner), and I would really love to practice explaining every detail like a true storyteller. The way cherry blossoms bloom in spring, the habits of neighbors I see on walks, the way that the snow whips across the air in winter. True noticing is a lost art in an age of ruined attention span.',
      'Of course, the daughter was having her big coming-of-age moment: learning how to navigate adulthood in a totally foreign country, balancing for the first time what it meant to have her home and culture be so faraway from her current existence. But I appreciated that her mother also was having somewhat of her own arc, learning to be on her own and regaining feelings of youth and adventure. Anyone can have their moment whenever they want!'
    ],
  },
  {
    month: 1,
    image: './sunni-chauvinism.jpg',
    xOffset: -200,
    y: 250,
    scale: 0.45,
    restitution: 0.8,
    hoverText: 'Sunni Chauvinism and the Roots of Muslim Modernism',
    author: 'Teena U. Purohit',
    bodyText: [
      "Religion, one of humanity's most powerful motivating forces, is a funny thing. If you're born into a religious family, the expectation is that it will take root in the form of unwavering belief and how you should see the world and move through it. In adulthood, that experience makes it very hard unravel the tight bonds between how you feel about your birth religion and your emotions with your family. Especially when you grow up with the expectation that your culture and your religion are one and the same.",
      "That's why I appreciate books like one, which look at religions like Islam through a lens of political ideologies. It reminds me that there's nuance to ideas that are sometimes represented in binaries.",
      "Sunni Chauvinism centers around 'modernism', basically rethinking and unifying Islamic values in from an angle of more modern times. The argument for modernist wasn't necessarily about becoming more 'western' or 'Americanized', which I appreciated, but more of a reform while staying true to cultural roots. Purohit describes two groups: Sunni (the predominant sect of Islam) modernist leaders vs. other minority sect (such as the Ahmadis, Bahais, and Shi'a) leaders.",
      "I was pretty amused to read about repeated examples of Sunni leaders disparaging those minority sect leaders, even as they preached about modern unity of Islamic ideas and the Muslim ummah (people). Purohit goes on to describe their theorized jealousy that minority sect leaders were seen more as prophetic figures, when they aspired to be seen like that themselves.",
      "I'm not really a theologist, but I say all of this because I found it interesting that even some of the great Islamic leaders of history fall prey to incredibly human instincts, the want for power, control, and appreciation.  It makes me feel better about myself, as I try to carve out a place for my own beliefs."
    ],
  },
  {
    month: 1,
    image: './chain-gang.jpg',
    xOffset: -200,
    y: 250,
    scale: 0.45,
    restitution: 0.8,
    hoverText: 'Chain Gang All-Stars',
    author: 'Nana Kwame Adjei-Brenyah',
    bodyText: [
      "A very heavy read, yet exhilirating, adventurous, and paced by its captivating story and characters. The setting: a dystopian reality where death row inmates in America are offered spots in a gladiator-style program where prisoners can fight to the death for their freedom. The program is bundled into a globally consumed TV program called Chain Gang All-Stars. It is kind of like a Handmaid's Tale style of dystopia, centered around tbe prison industrial complex. And in the context of how ICE is operating in America today, you can see why it's a heavy read.",
      "As I moved through the story, I thought a lot about the themes that were bound together, nefarious systems that operated as parts of a whole. The way that consumer demand (the public who watched the gladiator fights as entertainment) amplified the need for violence. The need for entertainment contributed to the demand for branded merchandise for consumers to see in the show. The demand for branded merchandise offered an opportunity for corporations to capitalize. The ability for military tech and innovation to flourish as profit and demand grew from Chain Gang. None of these themes could fully live without the existence of the others, which I felt to be a very accurate reflection of real life.",
      "And the characters within this world, with the complexities that they hold. We learn about all kinds of reasons why different characters in the story's tapestry find themselves a part of Chain Gang All Stars. As we learn about the characters' convictions (both from a mental sense and judicial sense), we learn more about the oppressive prison system that has them there in the first place. On the outside of the games, there is an undergroud resistance movement dedicated to cutting through the general public's apathy, which offers a glimmer of hope."
    ],
  },
  {
    month: 2,
    image: './eileen.jpg',
    xOffset: 200,
    y: 250,
    scale: 0.35,
    restitution: 0.8,
    hoverText: 'Eileen',
    author: 'Otessa Moshfegh',
    bodyText: [
      "Probably the perfect story to be written in the midst of a brutal, bleak, desolate New England winter. Eileen Dunlop, our story's main character has bleak and brutal origins, a dead mother, drunkard father, and distant, never-to-be-seen-again sister. She works in a juvenile corrections center, obsessively stalks one of the guards that she's in love with, lays bare her disturbing thought patterns, loathes her life, and fantasizes running away from her small town and leaving her deadbeat to rot inside of it. A lot going on there. But honestly, kind of valid, considering the life that Moshfegh paints for her.",
      "And apparently there is a movie!!! Which I've just discovered through a Reddit thread on the book, so that's helpful. Not sure if I want to consume this book in movie form though. I appreciated that the story was told through the perspective of a much older version of herself, someone who 'used to be' Eileen.",
      "Moshfegh does a really brilliant job of navigating us through Eileen's psyche of disturbance, flatly telling us all of Eileen's thoughts that would normally stay way buried in the back of someone's mind.  I find it really interesting that Moshfegh told the story when the main character was a lot older, and she's gone through way more phases of life, love, and accceptance. As if to say 'actually things got a lot more chill after this part of my life'. I found it to be some sort of glimmer of hope in the midst of a murky tale."
    ],
  },
  {
    month: 2,
    image: './trying.jpg',
    xOffset: 400,
    y: 350,
    scale: 0.12,
    restitution: 0.8,
    hoverText: 'Trying',
    author: 'Chloe Caldwell',
    bodyText: [
      "So this book was assigned to our book club, but I didn't know I could make the meeting until two nights before. But luckily, it was a fast paced read, with plenty of breathable white space and an unexpected twist in the middle for both the reader and the author. Chloe Caldwell's memoir 'Trying' pulls her reader through her journey with infertility, and the act of trying to have a child. With fragments that feel like short essays, she shares all her complexities, Reddit threads, IUI appointments, infertility theories, hopes, and fears. Reading her book feels like she's talking to you about it herself at her place on the couch, or maybe she's invited you to read an excerpt of her journey.",
      "'Trying' feels like an appropriate title because of the all-encompassing nature of the word. Of course, there is the trying for conception, but also trying to make sense of what 'unexplained fertility' is and means, and trying to navigate how the costs of IUI appointments add up (financially, mentally, and physically). She shares a lot about her retail job at a boutique jean store, where other women are trying on their 'life-changing pants'. And of course, Caldwell's big twist in real time, she tries to navigate life and relationships after she discovers her husband has been cheating on her.",
      "As Caldwell closes her story in the aftermath of her husband's infidelity, her journey to conceive is joined by a new journey of queer freedom. I closed out the book without understanding if there was a moment of 'triumph' or 'success' for Caldwell, but I'm not sure if that is point anyways."],
  },

  {
    month: 2,
    image: './utopia-of-rules.png',
    xOffset: 600,
    y: 350,
    scale: 0.12,
    restitution: 0.8,
    hoverText: 'The Utopia of Rules',
    author: 'David Graeber',
    bodyText: [
      "Have you ever noticed that ATM machines, financial pillars of society, work perfectly every time you use them? They've dispensed the correct amount of money, with the correct amount of bills, at the right time, for the past half century or so. Contrast that with the fact that there are at least a few roads, bridges, and buildings out there that are faulty and inefficient. Core infrastructure SHOULD have the same success rate as ATM machines.",
      "David Graeber makes this observation in his 2015 book The Utopia of Rules, a collection of three essays centered around bureaucracy, its lack of imagination, the violence it upholds, and how it has affected technological advancement.",
      "We all participate in the ritual of endless form-filling and box-checking, for different kinds of mundane reasons. There even exists a sub-language to talk about bureaucracy in a corporate work setting. I've certainly been affected by all of these themes. At work, I throw around words like 'stakeholder' and 'fiscal year', which have absolutely no meaning in my personal life.",
      "I've even participated in an ultimate form of bureaucracy, a fiance visa application. My partner and I had to prove the legitimacy of our relationship to the U.S government through an endless collection of documents of photo evidence. So I've had the surreal experience of holding the summation of our relationship in a 50-page packet which had to be physically mailed to the USCIS office.",
      "About the universal experience of bureaucracy, Graeber says that it's meant to feel stupid and completely unimaginative. That bureaucracy is meant to make smart people feel dumb, and for well-meaning employees to seem incompetent. Graeber describes its lack of imagination as 'dead zones', and within those zones we feel incapable of imagining any alternative reality. But those alternative realities could exist."
    ],
  },

  {
    month: 3,
    image: './going-to-love-you.jpg',
    xOffset: 600,
    y: 350,
    scale: 0.35,
    restitution: 0.8,
    hoverText: "They're Going to Love You",
    author: 'Meg Howrey',
    bodyText: [
      "I had the privilege of reading this book through my girlfriend. Since she's a lifelong dancer, and this book is heavily centered in the world of ballet, she received it as a birthday gift. Little did either of them know that I am super selfish so I read it first (don't worry everyone was OK with that).",
      "And I was really happy I did so!! Howrey writes a brilliant story about the beauty of ballet, love, loss, betrayal, creative passion, New York in the 80s, and the AIDs epidemic. Howrey paces the story brilliantly, with a huge betrayal revealed at the end, unraveled like a long thread pulled from a woolen sleeve. The main players of the game: Carlisle, a successful dance choreographer in LA, her estranged father Robert, a legend of ballet, and his lifelong partner James.",
      "The story bounces around multiple time periods: from Carlisle as an adolescent pursuing excellency in ballet to gain approval from her father and James, to current day Carlisle, reckoning with the emminent passing of her father. All roads lead to Carlisle's ultimate betrayal, a dramatic event which leads to a severed relationship between father and daughter for almost 20 years. And you really see in Carlisle's past, the way she uses creative ambition as a vessel to achieve acceptance into James' and Robert's life. I felt like James' and Robert's apartment, simply called Bank Street, to mirror Carlisle's desire to fold it all into her being. That hopefully her temporary room in the apartment could become her permanent room, and excellency in ballet was her ticket to do so.",
      "And as for the art form of ballet, I learned a lot about its history, stories, legends, the relationships it explores, and the power it yields for ballerinas. The dance form of pointe, and the pointe shoes themselves, were described as weapons that ballerina wields to seize and destroy the world in front of them. The shoes make them stronger, and with every jump they hit the ground harder.",
      "Read this book if you are looking to explore: What is the weight of creative ambition, love, and loss? When you fall short a dream realized, is it too late to ever pursue it again?"
    ]
  },

  {
    month: 3,
    image: './emperor-of-gladness.jpg',
    xOffset: 600,
    y: 350,
    scale: 0.13,
    restitution: 0.8,
    hoverText: "Emperor of Gladness",
    author: 'Ocean Vuong',
    bodyText: [
      "Ocean Vuong has a way with sentences where he takes you down a long winding road of words, and you're like 'Woah, where's this going?'. At the end of the sentence, sometimes it's worth it, and sometimes you go to the next sentence feeling a little more confused. The Emperor of Gladness is a hefty but ultimately beautiful story layered in with other beautiful sub-stories. It centrally revolves around the 19-year-old (I think that's how old he is, I forget) Hai and the elderly Grazina.",
    ]
  },

  {
    month: 4,
    image: './lapvona.jpg',
    xOffset: 600,
    y: 350,
    scale: 0.15,
    restitution: 0.8,
    hoverText: "Lapvona",
    author: 'Ottessa Moshfegh',
    bodyText: [
      "This book was so nasty. Disgusting. I don't like thinking about it very much. I'm not sure what else to say.",
    ]
  },

  {
    month: 4,
    image: './flower-moon.webp',
    xOffset: 0,
    y: 250,
    scale: 0.6,
    restitution: 0.8,
    hoverText: "Killers of the Flower Moon",
    author: 'David Grann',
    bodyText: [
      "A beautifully, grippingly written account...",
    ]
  },

  {
    month: 5,
    image: './border-environments.jpg',
    xOffset: 0,
    y: 250,
    scale: 0.35,
    restitution: 0.8,
    hoverText: "Border Environments",
    author: 'the Centre for Research Architecture',
    bodyText: [
      "A beautifully, grippingly written account...",
    ]
  },

  {
    month: 5,
    image: './foster.jpeg',
    xOffset: 400,
    y: 250,
    scale: 0.13,
    restitution: 0.8,
    hoverText: "Foster",
    author: 'Claire Keegan',
    bodyText: [
      "A beautifully, grippingly written account...",
    ]
  },

  {
    month: 6,
    image: './free-play.webp',
    xOffset: -100,
    y: 250,
    scale: 0.25,
    restitution: 0.8,
    hoverText: "Free Play",
    author: 'Stephen Nachmanovich',
    bodyText: [
      "A well timed book for me personally, as I was in a spot where I was questioning my own creativity and what I was capable of.",
    ]
  },

  {
    month: 6,
    image: './empire-of-ai.jpg',
    xOffset: -100,
    y: 250,
    scale: 0.25,
    restitution: 0.8,
    hoverText: "Empire of AI",
    author: 'Karen Hao',
    bodyText: [
      "A prolonged piece of investigative journalism that uncovers the veil of how OpenAI came to exist, and how Sam Altman constructed and conducted his technological empire. It feels like the shift into an AI / agentic age has been so rapid that it's really easy to forget that OpenAI actually started as a non-profit. That idea is laughable now, as we are hurtling towards insanely valued IPOs from OpenAI and Anthropic.",
      "This book was interesting that I could speak on it for ages, but if I had to sum up my biggest takeaway in one phrase: technologies are not inevitable! It was so interesting to hear every senior executive at OpenAI say things like 'AGI is inevitable! All our problems will be solved', but never really know how to explain what they mean by that. Technology does not just appear out of thin air, and Hao does a really great job of laying the framework for the reader to understand how we collectively got to this point with advancements in computing and neural networks.",
      "Very notably, over the past ten years the spending and technology power has shifted from universities and higher education to deep-pocketed corporations. The way that society experiences AI-powered capabilities today, does not have to be the predominant way. There ARE other ways to develop AI systems that don't use a million gallons of drinking water, that don't deplete the Global South of their resources.",
      "Oh actually, here's another huge takeaway: history repeats itself. Hao powerfully weaves comparisons of historic colonial imperialism to current day exploitation by the West and large companies today. We spin in cycles, round and round. Hao takes the reader across the global to tell these stories, from the exploitation of data cleaners and testers in Kenya and Venezuela, to the destruction of natural resources for data centers built in Chile. There are so many more untold stories to tell here, and there will absolutely be more stories to tell on this in the future.",
      "The comical thing about this book is that the potential sequels to this book just keep writing themselves in real time. This book came out even before OpenAI signed that huge deal with the Department of War to allow use of OpenAI systems and intelligence, right after Anthropic refused to. Sam Altman keeps saying and doing insane things, as do majority of AI tech executives in 2026."
    ]
  },


  {
    month: 7,
    image: './yesteryear.jpg',
    xOffset: 200,
    y: 300,
    scale: 0.35,
    restitution: 0.8,
    hoverText: "Yesteryear",
    author: 'Caro Claire Burke',
    bodyText: [
      "Another book club read which I was on a little bit of a time crunch to finish before the meeting, but the pages turned themselves and I finished well in time. Yesteryear is one of the more controversial books of 2026 (according to BookTok, which I'm not really on to be honest), and yeah I get it!",
    ]
  },

  {
    month: 8,
    image: './braiding-sweetgrass.jpg',
    xOffset: -100,
    y: 250,
    scale: 0.45,
    restitution: 0.8,
    hoverText: "Braiding Sweetgrass",
    author: 'Robin Wall Kimmerer',
    bodyText: [
      "My favorite book of this year so far, a book that has given me a bridge to the natural world around and a bridge to hope for better futures.",
    ]
  },

  



]

// Shared helper so book bodies can be created from the main effect or the month-change effect
function createImageBody(x, y, imageSrc, options = {}) {
  const {
    scale = 0.25,
    restitution = 0.8,
    hoverText = '',
    author = '',
    bodyText = []
  } = options

  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const imageWidth = img.naturalWidth * scale
      const imageHeight = img.naturalHeight * scale
      const imageBody = Matter.Bodies.rectangle(
        x, y, imageWidth, imageHeight,
        {
          render: {
            sprite: { texture: img.src, xScale: scale, yScale: scale },
            opacity: 0
          },
          restitution,
        }
      )
      imageBody.hoverText = hoverText
      imageBody.author = author
      imageBody.bodyText = Array.isArray(bodyText) ? bodyText : []
      imageBody.baseSpriteScale = scale
      resolve(imageBody)
    }
    img.onerror = () => {
      console.error(`Failed to load image: ${imageSrc}. Make sure the image is in the public folder.`)
      resolve(null)
    }
    img.src = imageSrc
  })
}

function App() {
  const sceneRef = useRef(null)
  const engineRef = useRef(null)
  const renderRef = useRef(null)
  const groundRef = useRef(null)
  const wallsRef = useRef(null)
  const imageBodiesRef = useRef([])
  const textBodiesRef = useRef([])
  const initialPositionsRef = useRef(new Map())
  const bookMetadataRef = useRef(new Map()) // bodyId -> { hoverText, author }
  const hoveredImageRef = useRef(null)
  const previouslyHoveredBodyRef = useRef(null) // for restoring scale when hover ends
  const [hoveredBook, setHoveredBook] = useState(null) // { title, author } when hovering an image
  const [isDraggingBook, setIsDraggingBook] = useState(false)
  const viewportDimensionsRef = useRef({ width: 0, height: 0 })
  const isPanelOpenRef = useRef(false)
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight })
  const [sceneOpacity, setSceneOpacity] = useState(1)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth() + 1) // 1–12
  const monthDirectionRef = useRef(1) // 1 = forward (next), -1 = back (prev)
  const selectedMonthRef = useRef(selectedMonth) // so async book-load can check if month changed
  

  // Debug panel state changes and update ref
  useEffect(() => {
    console.log('Panel state changed - isPanelOpen:', isPanelOpen, 'selectedImage:', selectedImage)
    isPanelOpenRef.current = isPanelOpen
  }, [isPanelOpen, selectedImage])

  // Resize matter-scene when panel opens/closes
  useEffect(() => {
    if (!renderRef.current || !engineRef.current || !wallsRef.current || !groundRef.current) {
      return
    }

    const render = renderRef.current
    const engine = engineRef.current
    const walls = wallsRef.current
    const ground = groundRef.current
    const panelWidth = 400
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    
    // Calculate new scene width (subtract panel width if open)
    const newSceneWidth = isPanelOpen ? viewportWidth - panelWidth : viewportWidth
    
    // Update renderer dimensions
    render.options.width = newSceneWidth
    render.options.height = viewportHeight
    
    // Update canvas dimensions (accounting for device pixel ratio)
    const pixelRatio = window.devicePixelRatio || 1
    render.canvas.width = newSceneWidth * pixelRatio
    render.canvas.height = viewportHeight * pixelRatio
    render.canvas.style.width = `${newSceneWidth}px`
    render.canvas.style.height = `${viewportHeight}px`
    
    // Update render bounds
    Matter.Render.setPixelRatio(render, pixelRatio)
    
    // Update right wall position and stroke (index 1 in walls array)
    const rightWall = walls[1]
    const wallThickness = 40
    Matter.Body.setPosition(rightWall, {
      x: newSceneWidth + wallThickness / 2,
      y: viewportHeight / 2
    })
    if (rightWall.render) {
      rightWall.render.lineWidth = isPanelOpen ? 1 : 0
      rightWall.render.strokeStyle = isPanelOpen ? '#0f002f' : 'transparent'
    }
    
    // Recreate top wall with new width (index 2 in walls array)
    const topWall = walls[2]
    Matter.World.remove(engine.world, topWall)
    const newTopWall = Matter.Bodies.rectangle(
      newSceneWidth / 2,
      -wallThickness / 2,
      newSceneWidth,
      wallThickness,
      {
        isStatic: true,
        render: {
          fillStyle: '#0f002f',
        }
      }
    )
    walls[2] = newTopWall
    Matter.World.add(engine.world, newTopWall)
    
    // Recreate ground with new width
    Matter.World.remove(engine.world, ground)
    const newGround = Matter.Bodies.rectangle(
      newSceneWidth / 2, 
      viewportHeight, 
      newSceneWidth, 
      10, 
      {
        isStatic: true,
        render: {
          fillStyle: '#0f002f',
          strokeStyle: '#60556e',
          lineWidth: 2,
        }
      }
    )
    groundRef.current = newGround
    Matter.World.add(engine.world, newGround)
    
    // Update mouse bounds
    if (render.mouse) {
      render.mouse.element = render.canvas
    }
    
    // When panel opens, push any bodies in the panel area back into the visible scene
    // Use a small delay to ensure walls are updated first
    if (isPanelOpen) {
      setTimeout(() => {
        // Bodies should be able to reach the scene edge (newSceneWidth), but not go beyond it
        const sceneEdge = newSceneWidth
        
        // Check all bodies in the world
        engine.world.bodies.forEach(body => {
          // Skip static bodies (walls, ground)
          if (body.isStatic) return
          
          // Get body bounds
          const bodyRight = body.bounds.max.x
          const bodyCenterX = body.position.x
          
          // If any part of the body is beyond the scene edge (in the panel area), push it back
          if (bodyRight > sceneEdge) {
            // Calculate body width
            const bodyWidth = body.bounds.max.x - body.bounds.min.x
            
            // Push the body back so its right edge is at the scene edge
            const newX = sceneEdge - (bodyWidth / 2)
            
            // Keep the body's current Y position
            const newY = body.position.y
            
            // Set new position
            Matter.Body.setPosition(body, { x: newX, y: newY })
            
            // Apply a small leftward velocity to push it away from the edge
            Matter.Body.setVelocity(body, {
              x: Math.min(body.velocity.x, -0.3), // Push left, but preserve existing leftward velocity
              y: body.velocity.y
            })
            
            console.log(`Pushed body back from x=${bodyCenterX.toFixed(0)} to x=${newX.toFixed(0)}`)
          }
        })
      }, 50) // Small delay to ensure walls are updated
    }
  }, [isPanelOpen])

  useEffect(() => {
    // Get viewport dimensions
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const bodyScaleFactor = viewportWidth <= 700 ? 0.5 : 1
    viewportDimensionsRef.current = { width: viewportWidth, height: viewportHeight }

    // Create engine
    const engine = Matter.Engine.create()
    engineRef.current = engine

    // Create renderer
    const render = Matter.Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: viewportWidth,
        height: viewportHeight,
        wireframes: false,
        background: '#0f002f',
        pixelRatio: window.devicePixelRatio || 1,
      }
    })
    renderRef.current = render
    
    // Ensure canvas doesn't block default behaviors
    render.canvas.style.touchAction = 'none'
    render.canvas.oncontextmenu = () => true // Allow right-click context menu

    // Create mouse and mouse constraint for dragging
    const mouse = Matter.Mouse.create(render.canvas)
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: {
          visible: false
        }
      }
    })
    
    // Track click vs drag
    let mouseDownBody = null
    let mouseDownTime = null
    let mouseDownPosition = null
    let hasDragged = false
    let panelOpenedByMatterEvent = false
    const DRAG_THRESHOLD = 5 // pixels - minimum distance to consider it a drag
    const HOVER_SCALE_DELTA = 0.01
    const HOVER_SCALE_LERP = 0.2

    const setHoverScaleTarget = (body, hovered) => {
      if (body?.baseSpriteScale !== undefined) {
        body.spriteScaleTarget = body.baseSpriteScale + (hovered ? HOVER_SCALE_DELTA : 0)
      }
    }

    // Skip hover/click/drag on bodies that are still fading in (e.g. after reset)
    const isBodyVisible = (body) => {
      if (!body) return false
      if (!body.render || body.render.opacity === undefined) return true
      return body.render.opacity >= 0.99
    }
    
    // Listen to mouse constraint events
    Matter.Events.on(mouseConstraint, 'mousedown', (event) => {
      mouseDownBody = event.body
      mouseDownTime = Date.now()
      hasDragged = false
      // Store mouse position at mousedown
      if (mouse && mouse.position) {
        mouseDownPosition = { x: mouse.position.x, y: mouse.position.y }
      }
      console.log('MouseDown on body:', mouseDownBody?.hoverText || 'no hoverText')
    })
    
    Matter.Events.on(mouseConstraint, 'startdrag', () => {
      // Check actual distance moved before marking as drag
      if (mouse && mouse.position && mouseDownPosition) {
        const dx = mouse.position.x - mouseDownPosition.x
        const dy = mouse.position.y - mouseDownPosition.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        if (distance > DRAG_THRESHOLD) {
          hasDragged = true
          console.log('Drag detected, distance:', distance)
        }
      } else {
        hasDragged = true
      }
      if (mouseConstraint.body && mouseConstraint.body.hoverText && isBodyVisible(mouseConstraint.body)) {
        setIsDraggingBook(true)
      }
    })
    
    // Handle mouse up - check if it was a click on an image body
    Matter.Events.on(mouseConstraint, 'mouseup', (event) => {
      setIsDraggingBook(false)
      console.log('MouseUp event fired')
      console.log('mouseDownBody:', mouseDownBody?.hoverText || 'none')
      console.log('event.body:', event.body?.hoverText || 'none')
      console.log('hasDragged:', hasDragged)
      
      // Check final distance if we have positions
      if (mouse && mouse.position && mouseDownPosition && !hasDragged) {
        const dx = mouse.position.x - mouseDownPosition.x
        const dy = mouse.position.y - mouseDownPosition.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        if (distance > DRAG_THRESHOLD) {
          hasDragged = true
          console.log('Final drag check - distance:', distance)
        }
      }
      
      // Use event.body as fallback if mouseDownBody is null
      const clickedBody = mouseDownBody || event.body
      
      // Small delay to ensure drag state is updated
      setTimeout(() => {
        // If we clicked on a body with hoverText and didn't drag, open panel (skip if body still fading in)
        if (clickedBody && clickedBody.hoverText && isBodyVisible(clickedBody) && !hasDragged) {
          const timeElapsed = Date.now() - mouseDownTime
          // Only open if it was a quick click (less than 500ms)
          if (timeElapsed < 500) {
            console.log('Opening panel for:', clickedBody.hoverText)
            const meta = bookMetadataRef.current.get(clickedBody.id) || { hoverText: clickedBody.hoverText, author: clickedBody.author != null ? String(clickedBody.author) : '', bodyText: clickedBody.bodyText ?? [] }
            const bodyAuthor = clickedBody.author != null ? String(clickedBody.author) : ''
            const author = bodyAuthor || meta.author
            const hoverText = meta.hoverText || clickedBody.hoverText
            const bodyText = meta.bodyText ?? clickedBody.bodyText ?? []
            if (bodyAuthor && meta.author !== bodyAuthor) {
              bookMetadataRef.current.set(clickedBody.id, { ...meta, hoverText, author: bodyAuthor })
            }
            setSelectedImage({
              bodyId: clickedBody.id,
              hoverText,
              author,
              bodyText,
            })
            setIsPanelOpen(true)
            panelOpenedByMatterEvent = true
            // Reset flag after a short delay
            setTimeout(() => {
              panelOpenedByMatterEvent = false
            }, 100)
          } else {
            console.log('Click too slow:', timeElapsed, 'ms')
          }
        } else {
          console.log('Panel not opened - body:', !!clickedBody, 'hoverText:', !!clickedBody?.hoverText, 'dragged:', hasDragged)
        }
        
        mouseDownBody = null
        mouseDownTime = null
        mouseDownPosition = null
        hasDragged = false
      }, 10)
    })
    
    // Track mouse down for fallback detection
    let mouseDownScreenPos = null
    let mouseDownTimeFallback = null
    let hasDraggedFallback = false
    
    const handleMouseDown = (event) => {
      // Don't interfere with right-clicks
      if (event.button === 2) return
      
      // Track mouse down position and time for drag detection
      mouseDownScreenPos = { x: event.clientX, y: event.clientY }
      mouseDownTimeFallback = Date.now()
      hasDraggedFallback = false
    }
    
    // Handle mouse up for click detection (primary method since Matter.Events aren't reliable)
    const handleImageClick = (event) => {
      // Don't interfere with right-clicks
      if (event.button === 2) return
      
      // Check if this was a drag by comparing mouse positions
      if (mouseDownScreenPos) {
        const dx = event.clientX - mouseDownScreenPos.x
        const dy = event.clientY - mouseDownScreenPos.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const timeElapsed = Date.now() - mouseDownTimeFallback
        
        // If mouse moved more than threshold or took too long, it was a drag
        if (distance > DRAG_THRESHOLD || timeElapsed > 500) {
          hasDraggedFallback = true
          console.log('Drag detected in fallback - distance:', distance, 'time:', timeElapsed)
        }
      }
      
      // Only proceed if it wasn't a drag
      if (hasDraggedFallback) {
        console.log('Skipping panel open - drag detected')
        mouseDownScreenPos = null
        mouseDownTimeFallback = null
        hasDraggedFallback = false
        return
      }
      
      // Use point query to detect clicks on image bodies
      // This is more reliable than Matter.Events for click detection
      const rect = render.canvas.getBoundingClientRect()
      const mouseX = event.clientX - rect.left
      const mouseY = event.clientY - rect.top
      
      // Convert screen coordinates to Matter.js world coordinates
      const pixelRatio = window.devicePixelRatio || 1
      const worldX = (mouseX / rect.width) * render.options.width
      const worldY = (mouseY / rect.height) * render.options.height
      
      const mousePosition = { x: worldX, y: worldY }
      
      // Check if mouse is over any image body using Matter.Query
      const bodiesUnderPoint = Matter.Query.point(engine.world.bodies, mousePosition)
      
      console.log('Click detected at:', mousePosition, 'bodies found:', bodiesUnderPoint.length)
      
      // Find the first visible image body with hoverText
      for (const body of bodiesUnderPoint) {
        if (body.hoverText && isBodyVisible(body)) {
          console.log('Opening panel for:', body.hoverText)
          const meta = bookMetadataRef.current.get(body.id) || { hoverText: body.hoverText, author: body.author != null ? String(body.author) : '', bodyText: body.bodyText ?? [] }
          const bodyAuthor = body.author != null ? String(body.author) : ''
          const author = bodyAuthor || meta.author
          const hoverText = meta.hoverText || body.hoverText
          const bodyText = meta.bodyText ?? body.bodyText ?? []
          if (bodyAuthor && meta.author !== bodyAuthor) {
            bookMetadataRef.current.set(body.id, { ...meta, hoverText, author: bodyAuthor })
          }
          setSelectedImage({
            bodyId: body.id,
            hoverText,
            author,
            bodyText,
          })
          setIsPanelOpen(true)
          console.log('Panel state set to open')
          break
        }
      }
      
      // Reset tracking
      mouseDownScreenPos = null
      mouseDownTimeFallback = null
      hasDraggedFallback = false
    }

    // Create ground (static body at the bottom) - width matches viewport
    const ground = Matter.Bodies.rectangle(
      viewportWidth / 2, 
      viewportHeight, 
      viewportWidth, 
      10, 
      {
        isStatic: true,
        render: {
          fillStyle: '#0f002f',
          strokeStyle: '#60556e',
          lineWidth: 1,
        }
      }
    )
    groundRef.current = ground

    // Create walls (left, right, top) to contain bodies
    const wallThickness = 40
    const walls = [
      // Left wall
      Matter.Bodies.rectangle(
        -wallThickness / 2,
        viewportHeight / 2,
        wallThickness,
        viewportHeight,
        {
          isStatic: true,
          render: {
            fillStyle: '#0f002f',
          }
        }
      ),
      // Right wall (same color as background; no visible stroke when panel closed)
      Matter.Bodies.rectangle(
        viewportWidth + wallThickness / 2,
        viewportHeight / 2,
        wallThickness,
        viewportHeight,
        {
          isStatic: true,
          render: {
            fillStyle: '#0f002f',
            strokeStyle: 'transparent',
            lineWidth: 0,
          }
        }
      ),
      // Top wall
      Matter.Bodies.rectangle(
        viewportWidth / 2,
        -wallThickness / 2,
        viewportWidth,
        wallThickness,
        {
          isStatic: true,
          render: {
            fillStyle: '#0f002f',
          }
        }
      )
    ]
    wallsRef.current = walls


    // All three title pills are now images; no text bodies
    const textBodies = []
    
    textBodiesRef.current = textBodies
    
    // Helper function to fade in a body over 500ms
    const fadeInBody = (body, duration = 500) => {
      if (!body.render) {
        body.render = {}
      }
      body.render.opacity = 0
      body.fadeStartTime = Date.now()
      body.fadeDuration = duration
      
      const fadeIn = () => {
        const elapsed = Date.now() - body.fadeStartTime
        const progress = Math.min(elapsed / body.fadeDuration, 1)
        body.render.opacity = progress
        
        if (progress < 1) {
          requestAnimationFrame(fadeIn)
        } else {
          body.render.opacity = 1
        }
      }
      
      requestAnimationFrame(fadeIn)
    }
    
    // Journal pill as image (first spawn slot, at 0ms)
    createImageBody(viewportWidth / 2 - 110, 0, './journal.webp', {
      scale: 0.07 * bodyScaleFactor,
      restitution: 0.8
    }).then(journalBody => {
      if (!journalBody) return
      initialPositionsRef.current.set(journalBody.id, {
        x: journalBody.position.x,
        y: journalBody.position.y,
        angle: journalBody.angle
      })
      setTimeout(() => {
        Matter.World.add(engine.world, journalBody)
        fadeInBody(journalBody, 500)
      }, 0)
    }).catch(err => console.warn('Journal image load failed:', err))

    // Reading pill as image (second spawn slot, at 200ms)
    createImageBody(viewportWidth / 2 - 150, 0, './reading.webp', {
      scale: 0.07 * bodyScaleFactor,
      restitution: 0.8
    }).then(readingBody => {
      if (!readingBody) return
      initialPositionsRef.current.set(readingBody.id, {
        x: readingBody.position.x,
        y: readingBody.position.y,
        angle: readingBody.angle
      })
      setTimeout(() => {
        Matter.World.add(engine.world, readingBody)
        fadeInBody(readingBody, 500)
      }, 200)
    }).catch(err => console.warn('Reading image load failed:', err))

    // Usman's pill as image (third spawn slot, at 400ms)
    createImageBody(viewportWidth / 2 - 190, 0, './usmans-1.webp', {
      scale: 0.07 * bodyScaleFactor,
      restitution: 0.8
    }).then(usmansBody => {
      if (!usmansBody) return
      initialPositionsRef.current.set(usmansBody.id, {
        x: usmansBody.position.x,
        y: usmansBody.position.y,
        angle: usmansBody.angle
      })
      setTimeout(() => {
        Matter.World.add(engine.world, usmansBody)
        fadeInBody(usmansBody, 500)
      }, 400)
    }).catch(err => console.warn('Usmans image load failed:', err))

    // Book bodies are added only by the selectedMonth effect (so no double-add or wrong month from delayed main effect)

    // Add walls, ground, and mouse constraint to the world immediately
    // Text bodies are added with staggered delays, image bodies after text bodies
    Matter.World.add(engine.world, [ground, ...walls, mouseConstraint])

    // Keep the mouse in sync with rendering
    render.mouse = mouse

    // Helper function to create grain texture for pills
    const createPillGrainTexture = (width, height) => {
      const grainCanvas = document.createElement('canvas')
      grainCanvas.width = width
      grainCanvas.height = height
      const grainCtx = grainCanvas.getContext('2d')
      const imageData = grainCtx.createImageData(width, height)
      const data = imageData.data
      
      // Generate random noise
      for (let i = 0; i < data.length; i += 4) {
        const value = Math.random() * 255
        data[i] = value     // R
        data[i + 1] = value // G
        data[i + 2] = value // B
        data[i + 3] = 20    // A - low opacity for subtle grain
      }
      
      grainCtx.putImageData(imageData, 0, 0)
      return grainCanvas
    }

    // Handle mouse hover detection
    const handleMouseMove = (event) => {
      // Check for dragging while mouse is down
      if (mouseDownScreenPos) {
        const dx = event.clientX - mouseDownScreenPos.x
        const dy = event.clientY - mouseDownScreenPos.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        if (distance > DRAG_THRESHOLD) {
          hasDraggedFallback = true
        }
      }
      
      const rect = render.canvas.getBoundingClientRect()
      const mouseX = event.clientX - rect.left
      const mouseY = event.clientY - rect.top
      
      // Convert screen coordinates to Matter.js world coordinates
      // Matter.js render uses pixel ratio, so we need to account for that
      const pixelRatio = window.devicePixelRatio || 1
      const worldX = (mouseX / rect.width) * render.options.width
      const worldY = (mouseY / rect.height) * render.options.height
      
      const mousePosition = { x: worldX, y: worldY }
      
      // Check if mouse is over any image body using Matter.Query
      hoveredImageRef.current = null
      const bodiesUnderPoint = Matter.Query.point(engine.world.bodies, mousePosition)
      
      // Find the first visible image body with hoverText
      for (const body of bodiesUnderPoint) {
        if (body.hoverText && isBodyVisible(body)) {
          hoveredImageRef.current = body
          break
        }
      }

      // Set hover scale targets (animation happens in afterRender)
      if (previouslyHoveredBodyRef.current && previouslyHoveredBodyRef.current !== hoveredImageRef.current) {
        setHoverScaleTarget(previouslyHoveredBodyRef.current, false)
      }
      if (hoveredImageRef.current && previouslyHoveredBodyRef.current !== hoveredImageRef.current) {
        setHoverScaleTarget(hoveredImageRef.current, true)
      }
      previouslyHoveredBodyRef.current = hoveredImageRef.current
      
      // Update hover state for Framer Motion panel
      if (hoveredImageRef.current) {
        const body = hoveredImageRef.current
        let meta = bookMetadataRef.current.get(body.id)
        const bodyAuthor = body.author != null ? String(body.author) : ''
        const bodyHoverText = body.hoverText || ''
        if (!meta) meta = { hoverText: bodyHoverText, author: bodyAuthor }
        const author = bodyAuthor || meta.author
        const title = bodyHoverText || meta.hoverText || ''
        if (bodyAuthor && meta.author !== bodyAuthor) {
          bookMetadataRef.current.set(body.id, { ...bookMetadataRef.current.get(body.id), hoverText: title, author: bodyAuthor })
        }
        if (title) {
          setHoveredBook({ title, author })
        } else {
          setHoveredBook(null)
        }
      } else {
        setHoveredBook(null)
      }
    }
    
    const handleMouseLeave = () => {
      if (previouslyHoveredBodyRef.current) {
        setHoverScaleTarget(previouslyHoveredBodyRef.current, false)
        previouslyHoveredBodyRef.current = null
      }
      hoveredImageRef.current = null
      setHoveredBook(null)
      setIsDraggingBook(false)
      // Reset drag tracking when mouse leaves
      mouseDownScreenPos = null
      mouseDownTimeFallback = null
      hasDraggedFallback = false
    }
    
    // Add mouse event listeners to canvas
    render.canvas.addEventListener('mousemove', handleMouseMove)
    render.canvas.addEventListener('mouseleave', handleMouseLeave)
    render.canvas.addEventListener('mousedown', handleMouseDown)
    render.canvas.addEventListener('mouseup', handleImageClick)
    
    // Ensure context menu works (right-click) - don't prevent default
    render.canvas.addEventListener('contextmenu', (e) => {
      // Allow default context menu behavior - don't prevent default
      return true
    }, { passive: true })

    // Custom rendering for text bodies
    Matter.Events.on(render, 'afterRender', () => {
      const ctx = render.canvas.getContext('2d')

      // Smoothly lerp book body sprite scale toward hover target
      engine.world.bodies.forEach(body => {
        if (body.baseSpriteScale !== undefined && body.render?.sprite) {
          const target = body.spriteScaleTarget ?? body.baseSpriteScale
          const s = body.render.sprite
          s.xScale += (target - s.xScale) * HOVER_SCALE_LERP
          s.yScale += (target - s.yScale) * HOVER_SCALE_LERP
        }
      })
      
      // Draw text on all bodies that have text property
      engine.world.bodies.forEach(body => {
        if (body.text) {
          ctx.save()
          // Apply opacity for fade-in effect
          const opacity = body.render?.opacity !== undefined ? body.render.opacity : 1
          ctx.globalAlpha = opacity
          ctx.translate(body.position.x, body.position.y)
          ctx.rotate(body.angle)
          
          // Set font to measure text width
          ctx.font = `${body.text.size}px ${body.text.font}`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          
          // Measure text width
          const textMetrics = ctx.measureText(body.text.content)
          const textWidth = textMetrics.width
          
          // Calculate rectangle dimensions to fit text
          const rectHeight = body.text.size * 1.4 // Static height proportional to font size
          const horizontalPadding = body.text.size * 0.6 // Padding on left and right
          const rectWidth = textWidth + (horizontalPadding * 2) // Width to fit text with padding
          const borderWidth = 2 // Border width
          
          // Create gradient for the rectangle background
          const gradient = ctx.createLinearGradient(
            -rectWidth / 2, 0,
            rectWidth / 2, 0
          )
          gradient.addColorStop(0, '#6b46c1') // Purple start
          gradient.addColorStop(0.5, '#9333ea') // Purple middle
          gradient.addColorStop(1, '#a855f7') // Purple end
          
          // Draw rectangular background with gradient
          ctx.beginPath()
          ctx.rect(-rectWidth / 2, -rectHeight / 2, rectWidth, rectHeight)
          ctx.fillStyle = gradient
          ctx.fill()
          
          // Create and apply grain texture to the rectangle
          const grainTexture = createPillGrainTexture(Math.ceil(rectWidth), Math.ceil(rectHeight))
          ctx.save()
          ctx.beginPath()
          ctx.rect(-rectWidth / 2, -rectHeight / 2, rectWidth, rectHeight)
          ctx.clip()
          ctx.globalCompositeOperation = 'overlay'
          ctx.drawImage(grainTexture, -rectWidth / 2, -rectHeight / 2)
          ctx.restore()
          
          // Draw border with text color
          ctx.beginPath()
          ctx.rect(-rectWidth / 2, -rectHeight / 2, rectWidth, rectHeight)
          ctx.strokeStyle = body.text.color
          ctx.lineWidth = borderWidth
          ctx.stroke()
          
          // Draw text centered on top
          ctx.fillStyle = body.text.color
          ctx.fillText(body.text.content, 0, 0)
          ctx.restore()
        }
      })
      
      // Continuously check and push bodies back if they're in the panel area
      if (isPanelOpenRef.current) {
        const panelWidth = 400
        const viewportWidth = window.innerWidth
        const newSceneWidth = viewportWidth - panelWidth
        // Bodies should be able to reach the scene edge, but not go beyond it
        const sceneEdge = newSceneWidth
        
        engine.world.bodies.forEach(body => {
          // Skip static bodies (walls, ground)
          if (body.isStatic) return
          
          // Get body bounds
          const bodyRight = body.bounds.max.x
          
          // If any part of the body is beyond the scene edge (in the panel area), push it back
          if (bodyRight > sceneEdge) {
            // Calculate body width
            const bodyWidth = body.bounds.max.x - body.bounds.min.x
            
            // Push the body back so its right edge is at the scene edge
            const newX = sceneEdge - (bodyWidth / 2)
            
            // Keep the body's current Y position
            const newY = body.position.y
            
            // Set new position
            Matter.Body.setPosition(body, { x: newX, y: newY })
            
            // Apply a small leftward velocity to push it away from the edge
            // Only if it's moving right, otherwise preserve existing velocity
            if (body.velocity.x > 0) {
              Matter.Body.setVelocity(body, {
                x: -0.3, // Push left
                y: body.velocity.y
              })
            }
          }
        })
      }
    })

    // Run the renderer
    Matter.Render.run(render)

    // Create runner and run the engine
    const runner = Matter.Runner.create()
    Matter.Runner.run(runner, engine)

    // Handle window resize - trigger complete scene refresh with fade on mouse release
    let isResizing = false
    let resizeTimeout
    let refreshTimeout
    
    const handleResize = () => {
      // Only refresh scene if panel is closed
      if (isPanelOpenRef.current) {
        return // Skip refresh when panel is open
      }
      
      isResizing = true
      clearTimeout(resizeTimeout)
      clearTimeout(refreshTimeout)
      
      // Clear any pending refresh
      refreshTimeout = setTimeout(async () => {
        // Fade out
        setSceneOpacity(0)
        
        // Wait for fade out animation (0.25 seconds)
        await new Promise(resolve => setTimeout(resolve, 250))
        
        // Update window size to trigger scene refresh
        setWindowSize({ width: window.innerWidth, height: window.innerHeight })
        
        // Fade in after a brief delay to ensure scene is initialized
        setTimeout(() => {
          setSceneOpacity(1)
        }, 50)
        
        isResizing = false
      }, 300) // Wait 300ms after resize stops before refreshing
    }
    
    const handleMouseUp = async () => {
      // Only refresh scene if panel is closed
      if (!isResizing || isPanelOpenRef.current) {
        return // Skip refresh when panel is open
      }
      
      clearTimeout(refreshTimeout)
      
      // Fade out
      setSceneOpacity(0)
      
      // Wait for fade out animation (0.25 seconds)
      await new Promise(resolve => setTimeout(resolve, 250))
      
      // Update window size to trigger scene refresh
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
      
      // Fade in after a brief delay to ensure scene is initialized
      setTimeout(() => {
        setSceneOpacity(1)
      }, 50)
      
      isResizing = false
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('mouseup', handleMouseUp)

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mouseup', handleMouseUp)
      if (render.canvas) {
        render.canvas.removeEventListener('mousemove', handleMouseMove)
        render.canvas.removeEventListener('mouseleave', handleMouseLeave)
        render.canvas.removeEventListener('mousedown', handleMouseDown)
        render.canvas.removeEventListener('mouseup', handleImageClick)
      }
      if (resizeTimeout) {
        clearTimeout(resizeTimeout)
      }
      if (refreshTimeout) {
        clearTimeout(refreshTimeout)
      }
      imageBodiesRef.current = [] // clear so month effect doesn't hold stale body refs after resize
      Matter.Render.stop(render)
      Matter.Runner.stop(runner)
      Matter.Engine.clear(engine)
      if (render.canvas) {
        render.canvas.remove()
      }
    }
  }, [windowSize])

  // When selectedMonth or windowSize changes, remove old book bodies and add current month's books (only book bodies; pills stay)
  useEffect(() => {
    selectedMonthRef.current = selectedMonth

    const engine = engineRef.current
    const render = renderRef.current
    if (!engine || !render) return

    const viewportWidth = render.options.width
    const viewportHeight = render.options.height
    const bodyScaleFactor = viewportWidth <= 700 ? 0.5 : 1
    const monthForThisRun = selectedMonth

    // Remove ALL book bodies from the world by scanning (not ref), so wrong month never stays even if ref was stale
    const bookBodiesInWorld = engine.world.bodies.filter(b => !b.isStatic && b.hoverText)
    if (bookBodiesInWorld.length > 0) {
      Matter.World.remove(engine.world, bookBodiesInWorld)
      bookBodiesInWorld.forEach(body => {
        initialPositionsRef.current.delete(body.id)
        bookMetadataRef.current.delete(body.id)
      })
    }
    imageBodiesRef.current = []

    const booksForMonth = IMAGE_BOOKS.filter(book => book.month === monthForThisRun)
    const imageBodyPromises = booksForMonth.map(book => {
      // Scale position with viewport so layout stays proportional; clamp so books always spawn in scene
      const scaledX = viewportWidth / 2 + book.xOffset * (viewportWidth / REFERENCE_VIEWPORT_WIDTH) - SPAWN_LEFT_OFFSET
      const spawnX = Math.max(BOOK_SPAWN_X_MARGIN, Math.min(viewportWidth - BOOK_SPAWN_X_MARGIN, scaledX))
      const spawnY = Math.min(book.y, viewportHeight - BOOK_SPAWN_X_MARGIN) // keep above bottom
      return createImageBody(spawnX, spawnY, book.image, {
        scale: book.scale * bodyScaleFactor,
        restitution: book.restitution,
        hoverText: book.hoverText,
        author: book.author,
        bodyText: book.bodyText,
      })
    })

    Promise.all(imageBodyPromises).then(imageBodies => {
      const validBodies = imageBodies.filter(body => body !== null)
      if (validBodies.length === 0) return
      // Only add if month hasn't changed and engine is still current (avoid stale async adding wrong month or to dead engine)
      if (selectedMonthRef.current !== monthForThisRun) return
      if (engineRef.current !== engine) return

      Matter.World.add(engine.world, validBodies)
      imageBodiesRef.current = validBodies
      validBodies.forEach(body => {
        initialPositionsRef.current.set(body.id, {
          x: body.position.x,
          y: body.position.y,
          angle: body.angle
        })
        bookMetadataRef.current.set(body.id, {
          hoverText: body.hoverText || '',
          author: body.author != null ? String(body.author) : '',
          bodyText: body.bodyText ?? []
        })
        if (!body.render) body.render = {}
        body.render.opacity = 0
        body.fadeStartTime = Date.now()
        body.fadeDuration = 500
        const fadeIn = () => {
          const elapsed = Date.now() - body.fadeStartTime
          const progress = Math.min(elapsed / body.fadeDuration, 1)
          body.render.opacity = progress
          if (progress < 1) requestAnimationFrame(fadeIn)
          else body.render.opacity = 1
        }
        requestAnimationFrame(fadeIn)
      })
    })
  }, [selectedMonth, windowSize])

  // Same fade-in animation as on load (used by handleReset)
  const fadeInBody = (body, duration = 500) => {
    if (!body.render) body.render = {}
    body.render.opacity = 0
    body.fadeStartTime = Date.now()
    body.fadeDuration = duration
    const fadeIn = () => {
      const elapsed = Date.now() - body.fadeStartTime
      const progress = Math.min(elapsed / body.fadeDuration, 1)
      body.render.opacity = progress
      if (progress < 1) requestAnimationFrame(fadeIn)
      else body.render.opacity = 1
    }
    requestAnimationFrame(fadeIn)
  }

  // Reset: restore positions, then fade in everything at the same time
  const handleReset = () => {
    if (!engineRef.current) return
    const engine = engineRef.current

    // Move all resettable bodies to initial position, zero velocity, and set opacity to 0
    engine.world.bodies.forEach(body => {
      if (body.isStatic) return
      const initialPos = initialPositionsRef.current.get(body.id)
      if (initialPos) {
        Matter.Body.setPosition(body, { x: initialPos.x, y: initialPos.y })
        Matter.Body.setAngle(body, initialPos.angle)
        Matter.Body.setVelocity(body, { x: 0, y: 0 })
        Matter.Body.setAngularVelocity(body, 0)
        if (!body.render) body.render = {}
        body.render.opacity = 0
      }
    })

    // Fade in all bodies at once (same 500ms duration)
    engine.world.bodies.forEach(body => {
      if (body.isStatic) return
      if (initialPositionsRef.current.has(body.id)) {
        fadeInBody(body, 500)
      }
    })
  }

  return (
    <div className="app-container">
      <div className="content-wrapper">
        <div className={`month-picker ${isPanelOpen ? 'month-picker-disabled' : ''}`} aria-label="Select month">
          <button
            type="button"
            className="month-picker-btn"
            onClick={() => {
              monthDirectionRef.current = -1
              setSelectedMonth(m => (m <= 1 ? 12 : m - 1))
            }}
            aria-label="Previous month"
            disabled={isPanelOpen || selectedMonth === 1}
          >
            <img src={`${import.meta.env.DEV ? '' : import.meta.env.BASE_URL}ids-icon-arrow-left-solid.svg`} alt="Previous month" style={{ width: '14px', height: '14px', fill: '#f1e5ff' }} />
          </button>
          <div className="month-picker-label-wrap">
            <AnimatePresence initial={false}>
              <motion.span
                key={selectedMonth}
                className="month-picker-label"
                custom={monthDirectionRef.current}
                initial="enter"
                animate="center"
                exit="exit"
                variants={{
                  enter: (dir) => ({
                    opacity: 0,
                    x: `calc(-50% + ${-4 * dir}px)`,
                    transition: { opacity: { duration: 0.2, delay: 0.5 }, x: { duration: 0.2, delay: 0.5 } },
                  }),
                  center: {
                    opacity: 1,
                    x: '-50%',
                    transition: { duration: 0.2 },
                  },
                  exit: (dir) => ({
                    opacity: 0,
                    x: `calc(-50% + ${-4 * dir}px)`,
                    transition: { duration: 0.2 },
                  }),
                }}
              >
                {MONTH_NAMES[selectedMonth - 1]}
              </motion.span>
            </AnimatePresence>
          </div>
          <button
            type="button"
            className="month-picker-btn"
            onClick={() => {
              monthDirectionRef.current = 1
              setSelectedMonth(m => (m >= 12 ? 1 : m + 1))
            }}
            aria-label="Next month"
            disabled={isPanelOpen || selectedMonth === 8}
          >
            <img src={`${import.meta.env.DEV ? '' : import.meta.env.BASE_URL}ids-icon-arrow-right-solid.svg`} alt="Next month" style={{ width: '14px', height: '14px', fill: '#f1e5ff' }} />
          </button>
        </div>
        <div 
          ref={sceneRef} 
          className="matter-scene" 
          style={{ 
            opacity: sceneOpacity, 
            transition: 'opacity 0.25s ease-in-out',
            cursor: hoveredBook ? 'pointer' : undefined,
          }}
        >
          <AnimatePresence>
            {hoveredBook && (
              <div className="hover-text-wrapper">
                <motion.div
                  key={hoveredBook.title}
                  className="hover-text"
                  initial={{ opacity: 0, filter: 'blur(8px)', y: 8 }}
                  animate={{
                    opacity: 1,
                    filter: 'blur(0px)',
                    y: 0,
                    x: isDraggingBook ? [0, -3, 3, -3, 3, 0] : 0,
                  }}
                  exit={{ opacity: 0, filter: 'blur(8px)', y: 8 }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 30,
                    x: isDraggingBook ? { repeat: Infinity, duration: 0.1 } : { duration: 0.2 },
                  }}
                >
                  <span className="hover-text-title">{escapeHtml(hoveredBook.title)}</span>
                  <span className="hover-text-author">{hoveredBook.author ? `by ${escapeHtml(hoveredBook.author)}` : ''}</span>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
        <button className="reset-btn" onClick={handleReset}>Reset</button>
        <div 
          className={`side-panel ${isPanelOpen ? 'open' : ''}`}
        >
          <div className="side-panel-content">
            <button 
              className="close-panel-btn"
              onClick={() => setIsPanelOpen(false)}
            >
              ×
            </button>
            {selectedImage && (
              <div className="panel-text" style = {{ display: 'flex', flexDirection: 'column', gap: '24px'}}>
                <div style = {{ display: 'flex', flexDirection: 'column', gap: '4px'}}>
                  <h2 className="panel-text-title">{selectedImage.hoverText}</h2>
                  {selectedImage.author ? <p className="panel-text-author">by {selectedImage.author}</p> : null}
                </div>
                {(selectedImage.bodyText ?? []).length > 0
                  ? (selectedImage.bodyText ?? []).map((paragraph, i) => (
                      <p key={i} className="panel-text-body">{paragraph}</p>
                    ))
                  : <p className="panel-text-body">No description yet.</p>}
              </div>
            )}
          </div>
        </div>
      </div>
      {/*<div style={{ position: 'absolute', bottom: 168, left: 0, width: '100vw', height: 1, background: '#f1e5ff' }}></div>*/}
    </div>
  )
}

export default App
