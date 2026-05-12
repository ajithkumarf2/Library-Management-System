import db from './config/db.js';

const books = [
    { title: "To Kill a Mockingbird", author: "Harper Lee", category: "Fiction", isbn: "9780061120084", description: "A classic of modern American literature." },
    { title: "1984", author: "George Orwell", category: "Dystopian", isbn: "9780451524935", description: "A chilling prophecy of the future." },
    { title: "The Great Gatsby", author: "F. Scott Fitzgerald", category: "Classic", isbn: "9780743273565", description: "The story of the fabulously wealthy Jay Gatsby." },
    { title: "Pride and Prejudice", author: "Jane Austen", category: "Romance", isbn: "9780141439518", description: "A classic novel of manners." },
    { title: "The Catcher in the Rye", author: "J.D. Salinger", category: "Fiction", isbn: "9780316769174", description: "The story of Holden Caulfield." },
    { title: "The Hobbit", author: "J.R.R. Tolkien", category: "Fantasy", isbn: "9780547928227", description: "A prelude to the Lord of the Rings." },
    { title: "Fahrenheit 451", author: "Ray Bradbury", category: "Dystopian", isbn: "9781451673319", description: "A world where books are burned." },
    { title: "Brave New World", author: "Aldous Huxley", category: "Science Fiction", isbn: "9780060850524", description: "A vision of a futuristic society." },
    { title: "Moby Dick", author: "Herman Melville", category: "Adventure", isbn: "9780142437247", description: "The quest for the white whale." },
    { title: "The Odyssey", author: "Homer", category: "Epic Poetry", isbn: "9780140268867", description: "The travels of Odysseus." },
    { title: "The Alchemist", author: "Paulo Coelho", category: "Philosophical", isbn: "9780062315007", description: "A fable about following your dream." },
    { title: "Thinking, Fast and Slow", author: "Daniel Kahneman", category: "Psychology", isbn: "9780374275631", description: "A look at the dual systems of thought." },
    { title: "Sapiens", author: "Yuval Noah Harari", category: "History", isbn: "9780062316097", description: "A brief history of humankind." },
    { title: "Atomic Habits", author: "James Clear", category: "Self-Help", isbn: "9780735211292", description: "An easy way to build good habits." },
    { title: "The Silent Patient", author: "Alex Michaelides", category: "Thriller", isbn: "9781250301697", description: "A psychological thriller." },
    { title: "Dune", author: "Frank Herbert", category: "Science Fiction", isbn: "9780441172719", description: "The epic story of Arrakis." },
    { title: "The Shining", author: "Stephen King", category: "Horror", isbn: "9780307743657", description: "A classic horror novel." },
    { title: "The Da Vinci Code", author: "Dan Brown", category: "Mystery", isbn: "9780307474278", description: "A religious mystery-thriller." },
    { title: "Becoming", author: "Michelle Obama", category: "Memoir", isbn: "9781524763138", description: "The memoir of the former First Lady." },
    { title: "Educated", author: "Tara Westover", category: "Memoir", isbn: "9780399590504", description: "A young woman's quest for knowledge." },
    { title: "The Subtle Art of Not Giving a F*ck", author: "Mark Manson", category: "Self-Help", isbn: "9780062457714", description: "A counterintuitive approach to living a good life." },
    { title: "Circe", author: "Madeline Miller", category: "Mythology", isbn: "9780316556347", description: "A retelling of the myth of Circe." },
    { title: "Where the Crawdads Sing", author: "Delia Owens", category: "Fiction", isbn: "9780735219090", description: "A murder mystery and coming-of-age story." },
    { title: "Good to Great", author: "Jim Collins", category: "Business", isbn: "9780066620992", description: "Why some companies make the leap and others don't." },
    { title: "Quiet", author: "Susan Cain", category: "Psychology", isbn: "9780307352156", description: "The power of introverts in a world that can't stop talking." },
    { title: "The 7 Habits of Highly Effective People", author: "Stephen R. Covey", category: "Self-Help", isbn: "9781982137274", description: "Powerful lessons in personal change." },
    { title: "Deep Work", author: "Cal Newport", category: "Productivity", isbn: "9781455586691", description: "Rules for focused success in a distracted world." },
    { title: "Start with Why", author: "Simon Sinek", category: "Leadership", isbn: "9781591846444", description: "How great leaders inspire everyone to take action." },
    { title: "The Power of Now", author: "Eckhart Tolle", category: "Spirituality", isbn: "9781577314806", description: "A guide to spiritual enlightenment." },
    { title: "Man's Search for Meaning", author: "Viktor E. Frankl", category: "Philosophy", isbn: "9780807014295", description: "The search for meaning in suffering." },
    { title: "Zero to One", author: "Peter Thiel", category: "Business", isbn: "9780804139298", description: "Notes on startups and how to build the future." },
    { title: "The Lean Startup", author: "Eric Ries", category: "Business", isbn: "9780307887894", description: "How today's entrepreneurs use continuous innovation." },
    { title: "The Book Thief", author: "Markus Zusak", category: "Fiction", isbn: "9780375842207", description: "A story set in Nazi Germany." },
    { title: "Crime and Punishment", author: "Fyodor Dostoevsky", category: "Classic", isbn: "9780140449136", description: "A psychological study of crime." },
    { title: "The Brothers Karamazov", author: "Fyodor Dostoevsky", category: "Classic", isbn: "9780374528379", description: "A spiritual drama of moral struggles." },
    { title: "Anna Karenina", author: "Leo Tolstoy", category: "Classic", isbn: "9780143035008", description: "A tragic story of adultery and faith." },
    { title: "War and Peace", author: "Leo Tolstoy", category: "Classic", isbn: "9780307266934", description: "A panoramic vision of the Napoleonic Wars." },
    { title: "Les Misérables", author: "Victor Hugo", category: "Classic", isbn: "9780451419439", description: "A story of redemption and justice." },
    { title: "The Picture of Dorian Gray", author: "Oscar Wilde", category: "Classic", isbn: "9780141439570", description: "A philosophical novel of beauty and corruption." },
    { title: "The Old Man and the Sea", author: "Ernest Hemingway", category: "Fiction", isbn: "9780684801223", description: "A classic tale of a fisherman's struggle." },
    { title: "Guns, Germs, and Steel", author: "Jared Diamond", category: "Science", isbn: "9780393317558", description: "The fates of human societies." },
    { title: "A Brief History of Time", author: "Stephen Hawking", category: "Science", isbn: "9780553380163", description: "A landmark in scientific writing." },
    { title: "Cosmos", author: "Carl Sagan", category: "Science", isbn: "9780345331359", description: "A journey through the universe." },
    { title: "The Selfish Gene", author: "Richard Dawkins", category: "Science", isbn: "9780199291151", description: "A look at evolution from a gene's-eye view." },
    { title: "The Gene", author: "Siddhartha Mukherjee", category: "Science", isbn: "9781476733500", description: "An intimate history of the gene." },
    { title: "When Breath Becomes Air", author: "Paul Kalanithi", category: "Memoir", isbn: "9780812988406", description: "A life-affirming memoir of death." },
    { title: "The Emperor of All Maladies", author: "Siddhartha Mukherjee", category: "Science", isbn: "9781439170915", description: "A biography of cancer." },
    { title: "Homo Deus", author: "Yuval Noah Harari", category: "Philosophy", isbn: "9780062464316", description: "A brief history of tomorrow." },
    { title: "21 Lessons for the 21st Century", author: "Yuval Noah Harari", category: "Non-fiction", isbn: "9780525512172", description: "A guide to our current era." },
    { title: "The God of Small Things", author: "Arundhati Roy", category: "Fiction", isbn: "9780679457312", description: "A story of forbidden love in India." }
];

async function seed() {
    console.log("Starting book seeding...");
    for (const book of books) {
        try {
            await db.query(
                `INSERT INTO books (title, author, category, isbn, quantity, availableQuantity, description, shelfLocation, status) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [book.title, book.author, book.category, book.isbn, 5, 5, book.description, "Main Hall A1", "available"]
            );
            console.log(`Added: ${book.title}`);
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                console.log(`Skipping duplicate: ${book.title}`);
            } else {
                console.error(`Error adding ${book.title}:`, err.message);
            }
        }
    }
    console.log("Seeding complete!");
    process.exit();
}

seed();
