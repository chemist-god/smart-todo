"use client";

import { useState, useMemo } from "react";
import {
    QuestionMarkCircleIcon,
    MagnifyingGlassIcon,
    BookOpenIcon,
    LightBulbIcon,
    Cog6ToothIcon,
    ChartBarIcon,
    CurrencyDollarIcon,
    TrophyIcon,
    CheckCircleIcon,
    SparklesIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    DocumentTextIcon,
    VideoCameraIcon,
    AcademicCapIcon
} from "@heroicons/react/24/outline";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import HelpCategory from "@/components/help/HelpCategory";
import HelpArticle from "@/components/help/HelpArticle";
import HelpSearchResults from "@/components/help/HelpSearchResults";

interface HelpArticle {
    id: string;
    title: string;
    content: string;
    category: string;
    tags: string[];
    popular?: boolean;
}

const helpCategories = [
    {
        id: 'getting-started',
        name: 'Getting Started',
        icon: SparklesIcon,
        gradient: 'from-primary to-primary/80',
        description: 'Learn the basics and get up and running quickly'
    },
    {
        id: 'todos',
        name: 'Todos & Tasks',
        icon: CheckCircleIcon,
        gradient: 'from-success to-success/80',
        description: 'Master task management and productivity'
    },
    {
        id: 'stakes',
        name: 'Stakes & Challenges',
        icon: CurrencyDollarIcon,
        gradient: 'from-warning to-warning/80',
        description: 'Learn about stakes, rewards, and challenges'
    },
    {
        id: 'analytics',
        name: 'Analytics & Insights',
        icon: ChartBarIcon,
        gradient: 'from-info to-info/80',
        description: 'Understand your productivity data'
    },
    {
        id: 'achievements',
        name: 'Achievements & Rewards',
        icon: TrophyIcon,
        gradient: 'from-primary to-primary/80',
        description: 'Unlock achievements and earn rewards'
    },
    {
        id: 'settings',
        name: 'Settings & Preferences',
        icon: Cog6ToothIcon,
        gradient: 'from-muted-foreground to-muted-foreground/80',
        description: 'Customize your experience'
    }
];

const helpArticles: HelpArticle[] = [
    // Getting Started
    {
        id: 'welcome',
        title: 'Welcome to Smart Todo',
        content: `Smart Todo is your all-in-one productivity platform designed to help you achieve your goals through gamification, accountability, and intelligent task management.

**Key Features:**
- Task management with priority levels
- Stakes and challenges for accountability
- Achievement system for motivation
- Analytics to track your progress
- AI-powered focus recommendations

Get started by creating your first todo or exploring the dashboard!`,
        category: 'getting-started',
        tags: ['welcome', 'introduction', 'basics'],
        popular: true
    },
    {
        id: 'dashboard-overview',
        title: 'Understanding Your Dashboard',
        content: `Your dashboard is the command center of Smart Todo. Here's what you'll find:

**Stats Cards:**
- Total Points: Your accumulated XP from completing tasks
- Current Streak: Consecutive days of activity
- Active Todos: Tasks due today vs pending
- Achievements: Unlocked achievement count

**Focus Tasks:**
AI-powered recommendations based on the 80/20 rule and Eisenhower matrix to help you prioritize high-impact tasks.

**Level Progress:**
Track your level and XP progress. Gain XP by completing todos, creating notes, and maintaining streaks.`,
        category: 'getting-started',
        tags: ['dashboard', 'overview', 'stats'],
        popular: true
    },
    {
        id: 'creating-todos',
        title: 'Creating and Managing Todos',
        content: `**Creating a Todo:**
1. Navigate to the Todos page
2. Click "Create Todo" or use the quick action
3. Fill in the title, description, due date, and priority
4. Set points value (higher points = more XP)
5. Click "Create"

**Managing Todos:**
- Mark as complete to earn XP
- Edit todos by clicking on them
- Delete todos you no longer need
- Filter by status, priority, or date
- Use the search to find specific todos

**Priority Levels:**
- High: Urgent and important tasks
- Medium: Important but not urgent
- Low: Nice to have tasks

**Due Dates:**
Set due dates to track deadlines. Overdue todos are highlighted in red.`,
        category: 'todos',
        tags: ['todos', 'tasks', 'management', 'create'],
        popular: true
    },
    {
        id: 'stakes-basics',
        title: 'Understanding Stakes',
        content: `Stakes are financial commitments that help you stay accountable to your goals.

**Creating a Stake:**
1. Go to the Stakes page
2. Click "Create Stake"
3. Set your goal, deadline, and stake amount
4. Invite participants (optional)
5. Set rewards and penalties

**How Stakes Work:**
- You commit money to a stake
- Complete your goal by the deadline to get your money back + rewards
- Fail to complete and face penalties
- Participants can join and contribute

**Stake Types:**
- Personal: Just you
- Group: Multiple participants
- Public: Open to anyone

**Rewards & Penalties:**
- Rewards are distributed when you succeed
- Penalties are applied when you fail
- Both are customizable per stake`,
        category: 'stakes',
        tags: ['stakes', 'accountability', 'money', 'challenges'],
        popular: true
    },
    {
        id: 'achievements',
        title: 'Achievement System',
        content: `Achievements reward your consistent progress and milestones.

**How to Earn Achievements:**
- Complete todos consistently
- Maintain streaks
- Reach level milestones
- Complete special challenges
- Invite friends

**Achievement Types:**
- Streak achievements (7-day, 30-day, 100-day)
- Completion achievements (10 todos, 100 todos, etc.)
- Level achievements (Level 5, 10, 25, etc.)
- Social achievements (invite friends, join stakes)

**Viewing Achievements:**
Visit the Achievements page to see all available achievements, your progress, and unlocked achievements.`,
        category: 'achievements',
        tags: ['achievements', 'rewards', 'milestones', 'gamification'],
        popular: true
    },
    {
        id: 'analytics',
        title: 'Using Analytics',
        content: `Analytics help you understand your productivity patterns.

**Available Metrics:**
- Task completion rate
- Average completion time
- Productivity trends
- Streak history
- Category breakdown
- Time-based analysis

**Using Insights:**
- Identify your most productive times
- See which task types you complete fastest
- Track improvement over time
- Find areas for optimization

**Exporting Data:**
You can export your analytics data for external analysis.`,
        category: 'analytics',
        tags: ['analytics', 'insights', 'data', 'metrics'],
        popular: false
    },
    {
        id: 'notifications',
        title: 'Notification Settings',
        content: `Stay informed with customizable notifications.

**Notification Types:**
- Todo reminders (due soon, overdue)
- Stake updates (deadline approaching, completed)
- Achievement unlocks
- System updates
- Friend activity

**Managing Notifications:**
1. Go to Settings > Notifications
2. Toggle notification types on/off
3. Set notification frequency
4. Choose delivery methods (in-app, email)

**Notification Preferences:**
- Real-time: Get notified immediately
- Daily digest: Summary once per day
- Weekly summary: Weekly overview
- Off: No notifications`,
        category: 'settings',
        tags: ['notifications', 'settings', 'preferences'],
        popular: false
    },
    {
        id: 'focus-tasks',
        title: 'AI-Powered Focus Tasks',
        content: `Focus Tasks use AI to recommend your highest-impact tasks.

**How It Works:**
- Analyzes your todos using the 80/20 rule
- Applies Eisenhower matrix (urgent vs important)
- Considers due dates and priorities
- Updates in real-time as you complete tasks

**Using Focus Tasks:**
- Check your dashboard for recommendations
- Focus on the top 3-5 tasks shown
- Complete them for maximum impact
- Let AI suggest new priorities

**Benefits:**
- Focus on what matters most
- Reduce decision fatigue
- Increase productivity
- Achieve more with less effort`,
        category: 'todos',
        tags: ['focus', 'ai', 'priorities', 'productivity'],
        popular: true
    },
    {
        id: 'points-system',
        title: 'Points and XP System',
        content: `Earn points and level up as you use Smart Todo.

**Earning Points:**
- Complete todos (points based on priority)
- Create notes
- Maintain daily streaks
- Unlock achievements
- Complete stakes

**Leveling Up:**
- Every 100 XP = 1 level
- Higher levels unlock new features
- Show off your level on your profile
- Compete on leaderboards

**Using Points:**
- Track your progress
- Unlock achievements
- Compare with friends
- Motivate yourself to stay active`,
        category: 'getting-started',
        tags: ['points', 'xp', 'levels', 'gamification'],
        popular: true
    }
];

export default function HelpCenterPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [expandedArticle, setExpandedArticle] = useState<string | null>(null);

    // Filter articles based on search and category
    const filteredArticles = useMemo(() => {
        let filtered = helpArticles;

        if (selectedCategory) {
            filtered = filtered.filter(article => article.category === selectedCategory);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(article =>
                article.title.toLowerCase().includes(query) ||
                article.content.toLowerCase().includes(query) ||
                article.tags.some(tag => tag.toLowerCase().includes(query))
            );
        }

        return filtered;
    }, [searchQuery, selectedCategory]);

    const popularArticles = helpArticles.filter(a => a.popular);

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            <div className="p-3 sm:p-4 md:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
                    {/* Header */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
                                <QuestionMarkCircleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                                    Help Center
                                </h1>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                    Find answers and learn how to get the most out of Smart Todo
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                            <Input
                                placeholder="Search for help articles..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 sm:pl-12 h-11 sm:h-12 bg-muted/30 border-border/50 focus:bg-background text-sm sm:text-base"
                            />
                        </div>
                    </div>

                    {/* Search Results */}
                    {searchQuery && (
                        <HelpSearchResults
                            articles={filteredArticles}
                            query={searchQuery}
                            onSelectArticle={(id) => {
                                setExpandedArticle(id);
                                setSelectedCategory(null);
                            }}
                        />
                    )}

                    {/* Popular Articles */}
                    {!searchQuery && !selectedCategory && (
                        <div className="space-y-3 sm:space-y-4">
                            <div className="flex items-center gap-2">
                                <LightBulbIcon className="h-5 w-5 text-warning" />
                                <h2 className="text-lg sm:text-xl font-semibold text-foreground">Popular Articles</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                {popularArticles.map((article) => (
                                    <HelpArticle
                                        key={article.id}
                                        article={article}
                                        isExpanded={expandedArticle === article.id}
                                        onToggle={() => setExpandedArticle(
                                            expandedArticle === article.id ? null : article.id
                                        )}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Categories */}
                    {!searchQuery && (
                        <div className="space-y-3 sm:space-y-4">
                            <div className="flex items-center gap-2">
                                <BookOpenIcon className="h-5 w-5 text-primary" />
                                <h2 className="text-lg sm:text-xl font-semibold text-foreground">Browse by Category</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                {helpCategories.map((category) => (
                                    <HelpCategory
                                        key={category.id}
                                        category={category}
                                        isSelected={selectedCategory === category.id}
                                        articleCount={helpArticles.filter(a => a.category === category.id).length}
                                        onClick={() => {
                                            setSelectedCategory(
                                                selectedCategory === category.id ? null : category.id
                                            );
                                            setExpandedArticle(null);
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Category Articles */}
                    {selectedCategory && !searchQuery && (
                        <div className="space-y-3 sm:space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                                    {helpCategories.find(c => c.id === selectedCategory)?.name} Articles
                                </h2>
                                <Button
                                    onClick={() => setSelectedCategory(null)}
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs sm:text-sm"
                                >
                                    Back to categories
                                </Button>
                            </div>
                            <div className="space-y-3 sm:space-y-4">
                                {filteredArticles.map((article) => (
                                    <HelpArticle
                                        key={article.id}
                                        article={article}
                                        isExpanded={expandedArticle === article.id}
                                        onToggle={() => setExpandedArticle(
                                            expandedArticle === article.id ? null : article.id
                                        )}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Contact Support */}
                    <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 sm:mb-2">
                                    Still need help?
                                </h3>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                    Can't find what you're looking for? Our support team is here to help.
                                </p>
                            </div>
                            <Button
                                variant="default"
                                size="sm"
                                className="bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                                Contact Support
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

