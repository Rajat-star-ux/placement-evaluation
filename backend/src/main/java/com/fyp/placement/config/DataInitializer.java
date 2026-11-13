package com.fyp.placement.config;

import com.fyp.placement.entity.Question;
import com.fyp.placement.entity.User;
import com.fyp.placement.repository.QuestionRepository;
import com.fyp.placement.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final QuestionRepository questionRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, QuestionRepository questionRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.questionRepository = questionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Seed default demo student if not present
        if (!userRepository.existsByEmail("student@fyp.com")) {
            User demoUser = new User("student@fyp.com", passwordEncoder.encode("password123"), "Alex Johnson", "Software Development Engineer");
            userRepository.save(demoUser);
        }

        // Clean out any legacy QUANT aptitude questions
        List<Question> quantQuestions = questionRepository.findByDomainIgnoreCase("QUANT");
        if (!quantQuestions.isEmpty()) {
            questionRepository.deleteAll(quantQuestions);
        }

        // Seed comprehensive question bank across domains (JAVA, DSA, SYSTEM_DESIGN, BEHAVIORAL)
        if (questionRepository.count() < 12) {
            questionRepository.deleteAll(); // Refresh with rich domain-specific question bank

            List<Question> allQuestions = List.of(
                // ==================== JAVA: EASY ====================
                new Question(
                    "OOP Principles in Real-World Software",
                    "JAVA", "EASY",
                    "Explain the four pillars of Object-Oriented Programming (OOP)—Encapsulation, Abstraction, Inheritance, and Polymorphism. Give real-world software examples for method overloading versus method overriding.",
                    "1. Encapsulation: Bundling data and methods with private fields and getters/setters. 2. Abstraction: Hiding implementation details using interfaces or abstract classes. 3. Inheritance: Reusing code via parent-child class hierarchy. 4. Polymorphism: Compile-time (method overloading) and runtime (method overriding) dynamic dispatch.",
                    "Infosys", "encapsulation, abstraction, inheritance, polymorphism, overloading, overriding, interface"
                ),
                new Question(
                    "Java String Immutability & String Constant Pool",
                    "JAVA", "EASY",
                    "Why are String objects immutable in Java? Explain the difference between String, StringBuilder, and StringBuffer, and how the String Constant Pool optimizes heap memory.",
                    "Strings are immutable for security, thread safety, synchronization, and caching hash codes. The JVM stores string literals in the String Constant Pool in Heap memory. StringBuilder is mutable and non-synchronized (faster), while StringBuffer is thread-safe with synchronized methods.",
                    "TCS", "immutable, string pool, heap, thread safety, stringbuilder, stringbuffer, hashcode"
                ),
                new Question(
                    "Spring Boot Core Annotations & Dependency Injection",
                    "JAVA", "EASY",
                    "What is the difference between @Component, @Service, and @Repository in Spring Boot? How does Dependency Injection work with @Autowired?",
                    "@Component is the generic stereotype for any Spring-managed bean. @Service marks service layer business logic, and @Repository marks persistence layer classes with automatic SQLExpression exception translation. Spring IoC container injects required dependencies via constructor, setter, or field injection.",
                    "Wipro", "component, service, repository, dependency injection, autowired, ioc container, bean"
                ),

                // ==================== JAVA: MEDIUM ====================
                new Question(
                    "HashMap Internal Implementation & Hash Collisions",
                    "JAVA", "MEDIUM",
                    "How does HashMap work internally in Java 8+? Explain how hash codes, bucket indexing, and hash collisions are handled using linked lists and red-black trees.",
                    "Java HashMap uses an array of Node buckets. Index is computed as hash & (n-1). Collisions append to a LinkedList; if bucket count exceeds 8 and capacity >= 64, it treeifies into a Red-Black Tree for O(log N) lookup. Rehash occurs at load factor 0.75.",
                    "Amazon", "hashcode, bucket, red-black tree, collision, treeify, equals, load factor"
                ),
                new Question(
                    "Java Memory Management & Generational GC",
                    "JAVA", "MEDIUM",
                    "Explain how Java Memory Management works, specifically detailing the JVM Heap (Young Generation, Survivor spaces, Old Generation), Stack, Metaspace, and Garbage Collection (G1GC vs ZGC).",
                    "The JVM splits memory into Stack (thread frames, primitives) and Heap (objects). Young Gen (Eden, S0, S1) holds new allocations; survivors promote to Old Gen after aging thresholds. G1GC divides heap into equal regions for concurrent mark-and-sweep, while ZGC achieves sub-millisecond pauses using colored pointers.",
                    "Google", "heap, stack, young generation, old generation, eden, survivor, g1gc, zgc, metaspace"
                ),
                new Question(
                    "Spring Boot @Transactional & AOP Proxies",
                    "JAVA", "MEDIUM",
                    "How does the @Transactional annotation work internally in Spring Boot using AOP proxies? Explain transaction propagation levels and rollback rules.",
                    "Spring wraps @Transactional beans in CGLIB or JDK dynamic proxies. Before method execution, it opens a database connection/transaction. On success, it commits; on Unchecked/RuntimeException, it rolls back by default. Propagation levels include REQUIRED, REQUIRES_NEW, and MANDATORY.",
                    "Amazon", "transactional, aop proxy, propagation, rollback, requires_new, commit, cglib"
                ),

                // ==================== JAVA: HARD ====================
                new Question(
                    "Java Concurrency & Java Memory Model (JMM)",
                    "JAVA", "HARD",
                    "Explain thread synchronization in Java: synchronized keyword, ReentrantLock, volatile variables, and the JMM happens-before guarantee. How does ConcurrentHashMap achieve high concurrency?",
                    "Volatile guarantees visibility across CPU core caches and prevents instruction reordering. ReentrantLock offers fairness policies, tryLock(), and condition variables. ConcurrentHashMap in Java 8 uses synchronized locks per bin head Node rather than segment-level locking, achieving lock-free CAS reads and granular writes.",
                    "Google", "concurrency, volatile, reentrantlock, jmm, happens-before, cas, concurrenthashmap"
                ),
                new Question(
                    "Resilience & Circuit Breakers in Microservices",
                    "JAVA", "HARD",
                    "How do you implement the Circuit Breaker pattern in Spring Boot using Resilience4j? Explain circuit states (CLOSED, OPEN, HALF-OPEN), fallback logic, and distributed tracing.",
                    "Resilience4j tracks call failure rates in a sliding window. If failure exceeds the threshold, the circuit transitions from CLOSED to OPEN, immediately returning fallbacks. After a wait duration, it enters HALF-OPEN to test backend health before closing. Distributed tracing uses Micrometer and Zipkin with trace IDs.",
                    "Amazon", "circuit breaker, resilience4j, closed, open, half-open, fallback, tracing, microservices"
                ),

                // ==================== DSA: EASY ====================
                new Question(
                    "Two Sum Problem with HashMap Lookup",
                    "DSA", "EASY",
                    "Given an array of integers and a target integer, explain how to find indices of two numbers that add up to target in O(N) time complexity using a HashMap.",
                    "Initialize a HashMap<Integer, Integer> storing value to index. For each number, compute complement = target - num. If map contains complement, return {map.get(complement), current_index}. Otherwise, put num into map. This runs in single-pass O(N) time and O(N) auxiliary space.",
                    "Google", "hashmap, two sum, complement, linear time, lookup, single pass"
                ),
                new Question(
                    "In-Place Reversal of Singly Linked List",
                    "DSA", "EASY",
                    "Explain how to reverse a Singly Linked List in-place using iterative three-pointer technique (prev, curr, next). Detail the time and space complexity.",
                    "Initialize prev = null, curr = head. While curr != null, store next = curr.next, reverse curr.next = prev, advance prev = curr, and advance curr = next. When loop finishes, prev is the new head. Time complexity is O(N) and space complexity is O(1).",
                    "Amazon", "linked list, reverse, pointers, in-place, linear time, constant space"
                ),
                new Question(
                    "Valid Parentheses Matching Using Stack",
                    "DSA", "EASY",
                    "Given a string containing parentheses '(', ')', '{', '}', '[', and ']', how do you verify if the string is valid and properly balanced using a Stack?",
                    "Iterate through the string. Push expected closing brackets onto a Stack when an opening bracket appears. When a closing bracket appears, check if the stack is non-empty and pop matches current character. If mismatch or stack is not empty at the end, return false. Runs in O(N) time.",
                    "TCS", "stack, parentheses, lifo, push, pop, balanced, linear time"
                ),

                // ==================== DSA: MEDIUM ====================
                new Question(
                    "Container With Most Water - Two Pointer Greedy",
                    "DSA", "MEDIUM",
                    "Given n non-negative integers representing heights of vertical lines, find two lines that together with the x-axis form a container holding the maximum water. Explain why the two-pointer greedy approach works in O(N) time.",
                    "Use two pointers starting at left=0 and right=n-1. Calculate area = min(height[left], height[right]) * (right - left). Track max_area. Move the pointer pointing to the shorter line inward because moving the taller line can never yield a larger area with decreasing width.",
                    "Google", "two pointers, area, greedy, height, width, linear time, optimal"
                ),
                new Question(
                    "Binary Tree Level Order Traversal (BFS)",
                    "DSA", "MEDIUM",
                    "Explain how to perform Breadth-First Search (BFS) level-order traversal of a binary tree using a Queue. How do you group nodes level by level?",
                    "Use a Queue initialized with root node. While queue is not empty, record current level size = queue.size(). Loop 'size' times, polling each node, adding its value to the current level list, and enqueuing its non-null left and right children. Append level list to results. Runs in O(N) time.",
                    "Amazon", "bfs, queue, binary tree, level order, fifo, breadth first search"
                ),
                new Question(
                    "Longest Substring Without Repeating Characters",
                    "DSA", "MEDIUM",
                    "Explain the Sliding Window technique to find the length of the longest substring without repeating characters in O(N) time using a character-index map.",
                    "Maintain left and right window pointers. Store each character's latest index in a Map. As right expands, if character is seen and its index >= left, jump left = map.get(char) + 1. Update max_length = max(max_length, right - left + 1). Runs in O(N) time with O(min(N, M)) space.",
                    "Google", "sliding window, substring, two pointers, hashmap, unique characters"
                ),

                // ==================== DSA: HARD ====================
                new Question(
                    "LRU Cache Design (O(1) Get & Put)",
                    "DSA", "HARD",
                    "Design and explain a Least Recently Used (LRU) Cache supporting get(key) and put(key, value) operations in O(1) time complexity. Why combine a HashMap and Doubly Linked List?",
                    "A HashMap provides O(1) key-to-node lookup. A Doubly Linked List provides O(1) node insertion at head (most recently used) and deletion at tail (least recently used eviction). When get() or put() occurs, move accessed node to head. When capacity exceeds, remove tail.prev node from both list and map.",
                    "Amazon", "lru cache, doubly linked list, hashmap, constant time, eviction, head, tail"
                ),
                new Question(
                    "Merge K Sorted Linked Lists Using Min-Heap",
                    "DSA", "HARD",
                    "Given K sorted linked lists, explain how to merge them into one sorted list in O(N log K) time using a Min-Heap (PriorityQueue).",
                    "Insert the head node of each of the K lists into a Min-Heap configured by node value. Poll the minimum node, append it to the merged list, and if that node has a next pointer, push node.next into the heap. The heap holds at most K elements at any time, leading to O(N log K) runtime.",
                    "Google", "min heap, priorityqueue, merge k lists, divide and conquer, log k, optimal"
                ),

                // ==================== SYSTEM DESIGN: EASY ====================
                new Question(
                    "Horizontal vs Vertical Scaling & Load Balancing",
                    "SYSTEM_DESIGN", "EASY",
                    "Explain the difference between horizontal and vertical scaling. How does a Load Balancer distribute incoming traffic across backend servers?",
                    "Vertical scaling adds CPU/RAM to a single server (bounded by hardware limits, single point of failure). Horizontal scaling adds multiple server instances behind a Load Balancer. Algorithms include Round Robin, Weighted Round Robin, Least Connections, and IP Hash with health checks.",
                    "Amazon", "horizontal scaling, vertical scaling, load balancer, round robin, least connections, redundancy"
                ),
                new Question(
                    "Relational (SQL) vs NoSQL Databases",
                    "SYSTEM_DESIGN", "EASY",
                    "When would you choose a Relational DB (MySQL, PostgreSQL) versus a NoSQL DB (MongoDB, DynamoDB)? Contrast ACID with BASE properties.",
                    "Choose SQL when structured schemas, complex joins, and strict ACID guarantees (banking, order management) are required. Choose NoSQL for unstructured schemas, horizontal sharding, and high-throughput low-latency key-value lookups following BASE (Basically Available, Soft-state, Eventual consistency).",
                    "Infosys", "sql, nosql, acid, base, mongodb, postgresql, transactions, eventual consistency"
                ),
                new Question(
                    "Monolith vs Microservices & API Gateway",
                    "SYSTEM_DESIGN", "EASY",
                    "Compare monolithic architecture with microservices architecture. What role does an API Gateway play in modern distributed applications?",
                    "Monoliths deploy all modules in a single codebase (simple to start, hard to scale independently). Microservices decompose applications into autonomous domain services communicating via REST/gRPC. The API Gateway acts as the single reverse proxy handling authentication, rate limiting, and SSL termination.",
                    "TCS", "monolith, microservices, api gateway, reverse proxy, authentication, rate limiting, routing"
                ),

                // ==================== SYSTEM DESIGN: MEDIUM ====================
                new Question(
                    "Design a Scalable URL Shortener (TinyURL)",
                    "SYSTEM_DESIGN", "MEDIUM",
                    "Design a scalable URL shortener service like TinyURL. Address key components: database schema, Base62 encoding, Redis caching, and high availability for 100M URLs.",
                    "Architecture: Client -> Route53 -> Load Balancer -> Stateless App Servers -> Redis Cache -> Distributed DB (Cassandra/MySQL). Use Base62 encoding (a-z, A-Z, 0-9) on auto-incrementing 64-bit integer IDs to produce 7-character short codes (3.5 trillion URLs). Cache popular lookups in Redis with 80-20 rule.",
                    "System Design", "base62, redis, load balancer, scalability, sharding, caching, tinyurl"
                ),
                new Question(
                    "Distributed Caching Strategies & Cache Invalidation",
                    "SYSTEM_DESIGN", "MEDIUM",
                    "Explain Cache-Aside, Write-Through, and Write-Back caching strategies. How do you prevent Cache Penetration, Cache Breakdown, and Cache Avalanche?",
                    "Cache-Aside reads cache first and loads from DB on miss. Write-Through writes to cache and DB simultaneously. Write-Back writes to cache and writes asynchronously to DB. Prevent Avalanche by adding random jitter to TTLs; prevent Breakdown using mutex locks; prevent Penetration using Bloom Filters.",
                    "Amazon", "caching, redis, cache aside, write through, ttl, bloom filter, avalanche, breakdown"
                ),
                new Question(
                    "Design an API Rate Limiter",
                    "SYSTEM_DESIGN", "MEDIUM",
                    "Design a scalable API Rate Limiter. Compare Token Bucket, Leaky Bucket, and Sliding Window algorithms. How do you implement distributed rate limiting with Redis?",
                    "Token Bucket allows traffic bursts and is memory efficient. Leaky Bucket enforces smooth constant rates. Sliding Window Counter provides strict accuracy across rolling windows. Distributed rate limiting uses Redis with Lua scripts or Redis cell to execute atomic GET-and-DECREMENT token operations.",
                    "Google", "rate limiter, token bucket, leaky bucket, sliding window, redis, lua script, distributed"
                ),

                // ==================== SYSTEM DESIGN: HARD ====================
                new Question(
                    "Real-Time Messaging & Notification Architecture (WhatsApp)",
                    "SYSTEM_DESIGN", "HARD",
                    "Design a real-time chat application for 50M concurrent users. Detail WebSocket management, message delivery with Kafka, offline message queues, and end-to-end encryption.",
                    "Client maintains persistent bidirectional WebSocket connection to Gateway. Chat Service distributes messages via Apache Kafka partitioned by conversation ID. Offline messages store in Cassandra/DynamoDB until recipient reconnects. Push notifications route via APNs/FCM. Redis cluster maintains presence status.",
                    "Google", "websocket, kafka, cassandra, push notifications, pub sub, presence, real time, chat"
                ),
                new Question(
                    "Scalable Video Streaming Platform (YouTube/Netflix)",
                    "SYSTEM_DESIGN", "HARD",
                    "Design a video streaming platform serving millions of concurrent viewers. Detail video ingestion, chunking, adaptive bitrate streaming (HLS/DASH), and CDN caching.",
                    "Upload pipeline stores raw video in S3 and dispatches transcoding tasks via message queue. Transcoders encode video into multiple resolutions (1080p, 720p, 480p) and chunk into 6-second segments with HLS playlist (.m3u8). Global CDNs cache video chunks near users for low latency adaptive streaming.",
                    "Amazon", "video streaming, hls, cdn, adaptive bitrate, s3, transcoding, chunking, caching"
                ),

                // ==================== BEHAVIORAL: EASY ====================
                new Question(
                    "Self Introduction & Engineering Passion",
                    "BEHAVIORAL", "EASY",
                    "Tell me about yourself, your computer science background, and why you are passionate about software engineering. Highlight one project you are most proud of building.",
                    "Provide a structured 2-minute elevator pitch: 1. Academic background and core technical focus. 2. Engineering passion (problem solving, building scalable software). 3. Key highlight of your capstone placement preparation project with measurable outcomes. 4. Why this role excites you.",
                    "General", "introduction, elevator pitch, background, projects, passion, communication"
                ),
                new Question(
                    "Handling Constructive Technical Feedback",
                    "BEHAVIORAL", "EASY",
                    "Describe a situation where a professor, peer, or senior developer gave you critical feedback on your code or architecture. How did you react and improve?",
                    "Explain your open-minded attitude: during code review, a peer highlighted high cyclomatic complexity in my service method. Rather than becoming defensive, I asked clarifying questions, researched design patterns, refactored into the Strategy pattern, and unit tested the improvement.",
                    "Infosys", "feedback, code review, improvement, refactoring, humility, teamwork"
                ),
                new Question(
                    "Prioritization Under Academic & Technical Deadlines",
                    "BEHAVIORAL", "EASY",
                    "How do you prioritize academic coursework, competitive coding practice, and development projects when faced with multiple conflicting deadlines?",
                    "Use the Eisenhower Matrix (urgent vs important). Break large milestones into daily sprint tasks using Trello/GitHub Projects. Focus on high-impact objectives first, communicate early if schedules slip, and maintain consistent daily practice routines.",
                    "TCS", "time management, prioritization, deadlines, organization, milestones"
                ),

                // ==================== BEHAVIORAL: MEDIUM ====================
                new Question(
                    "STAR Method - Delivering Under Tight Deadlines",
                    "BEHAVIORAL", "MEDIUM",
                    "Describe a situation where you faced a critical project deadline or severe technical roadblock. Explain using the STAR framework: Situation, Task, Action, and Result.",
                    "STAR Method: Situation: In our capstone project, our microservice API integration broke 4 days before submission. Task: Re-architect the communication layer without data loss. Action: Prioritized core REST endpoints, built fallback mocks, and worked extra hours debugging. Result: Delivered on time with 99.8% test stability.",
                    "Amazon", "star method, situation, task, action, result, deadline, ownership, resilience"
                ),
                new Question(
                    "Resolving Disagreements in a Software Team",
                    "BEHAVIORAL", "MEDIUM",
                    "Tell me about a disagreement you had with a team member regarding an architectural choice, tech stack, or task distribution. How did you resolve the conflict constructively?",
                    "Situation: Two teammates debated whether to use MongoDB or PostgreSQL for our placement portal. Action: Instead of subjective arguments, I created a proof of concept evaluating schema flexibility, transaction requirements, and query latency. Result: Team unanimously agreed on PostgreSQL with JSONB.",
                    "Google", "conflict resolution, teamwork, collaboration, proof of concept, objective decision"
                ),
                new Question(
                    "Rapidly Learning and Adopting a New Technology",
                    "BEHAVIORAL", "MEDIUM",
                    "Describe a project where you had to learn an unfamiliar programming language, framework, or cloud tool in a very short timeframe. How did you master it?",
                    "Situation: Needed to integrate WebSocket speech recognition for real-time AI interviewing in 1 week. Action: Read official Mozilla Web Speech docs, built isolated minimal prototypes, studied open-source repositories, and progressively integrated into React. Result: Delivered seamless voice feature on schedule.",
                    "Amazon", "fast learner, initiative, web speech api, documentation, prototype, adaptability"
                ),

                // ==================== BEHAVIORAL: HARD ====================
                new Question(
                    "Overcoming a Significant Engineering Failure",
                    "BEHAVIORAL", "HARD",
                    "Describe an engineering project or technical initiative that failed or did not meet expectations. What was the root cause, how did you recover, and what did you learn?",
                    "Situation: A database migration script caused deadlock during concurrent writes in user testing. Task: Perform incident post-mortem and restore data integrity. Action: Identified missing indexes and uncommitted transactions, rolled back safely, and introduced automated integration tests. Result: Zero subsequent concurrency bugs.",
                    "Google", "failure, post mortem, accountability, root cause, resilience, testing, growth mindset"
                ),
                new Question(
                    "Taking Unprompted Leadership & Mentorship",
                    "BEHAVIORAL", "HARD",
                    "Share an instance where you stepped up to lead a project or mentor peers without being formally assigned the leader. How did you align the team toward success?",
                    "Situation: In a 4-person hackathon, progress stalled due to ambiguous task ownership. Action: Stepped up to organize a 15-minute sync, mapped clear API contract interfaces between frontend and backend, and paired with junior members on Git workflows. Result: Team won 2nd place and completed MVP.",
                    "Amazon", "leadership, mentorship, initiative, organization, collaboration, hackathon"
                )
            );

            questionRepository.saveAll(allQuestions);
        }
    }
}
