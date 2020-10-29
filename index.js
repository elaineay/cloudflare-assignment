// https://developers.cloudflare.com/workers/learning/getting-started
const Router = require('./router')

const linksArray = [
    { "name": "Elaine Au-Yang's LinkedIn", "url": "https://www.linkedin.com/in/elaineauyang/" },
    { "name": "Elaine's Github", "url": "https://github.com/elaineay" },
    { "name": "Please Consider Hiring Elaine", "url": "https://shesPrettyAwesomeAndWouldBeAGreatAddition" }
]

const queryURL = "https://static-links-page.signalnerve.workers.dev"

class LinksTransformer {
    constructor(links) {
      this.links = links
    }
    
    element(element) {
        for (const item of this.links) {
            const url = item.url
            const newLink = '<a href = ' + item.url + '>' + item.name + '</a>'
            element.append(newLink, {html: true})
        }
    }
}

class ProfileUpdater {
    constructor(attribute) {
        this.attribute = attribute
    }

    element(element) {
        element.removeAttribute(this.attribute)
    }
}

class AvatarUpdater {
    constructor(srcLoc) {
        this.srcLoc = srcLoc
    }

    element(element) {
        element.setAttribute('src', this.srcLoc)
    }
}

class NameChanger {
    constructor(name) {
        this.name = name
    }

    element(element) {
        element.setInnerContent(this.name)
    }
}

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

function linksHandler(event) {
    const init = {
        headers: { 'content-type': 'application/json' },
    }
    const body = JSON.stringify(linksArray)
    return new Response(body, init)
}

async function elseHandler() {
    const staticResponse = await fetch(queryURL)
    return rewriter.transform(staticResponse)
}

const rewriter = new HTMLRewriter()
    .on('div#links', new LinksTransformer(linksArray))
    .on('div#profile', new ProfileUpdater('style'))
    .on('img#avatar', new AvatarUpdater('images/picture.jpg'))
    .on('h1#name', new NameChanger('Elaine Au-Yang'))

async function handleRequest(request) {
    const r = new Router()
    // // Replace with the appropriate paths and handlers
    // r.get('.*/bar', () => new Response('responding for /bar'))
    // r.get('/demos/router/foo', request => fetch(request)) // return the response from the origin
    // r.get('/', () => new Response('Hello worker!')) // return a default message for the root route
    
    r.get('.*/links', () => linksHandler())
    // TODO: change from foo to anything thats not links
    r.get('.*/*', () => elseHandler()) // anything thats not links

    const resp = await r.route(request)
    return resp
}

