import { supabase } from '../lib/supabase';
import { Lesson, LessonContent, Quiz, DailyStory, StoryScenario, AgeGroup, SafetyCategory } from '../types';

class LessonService {
  // Add debug logging to track what's happening
  async getAllLessons(): Promise<Lesson[]> {
    try {
      console.log('📚 [DEBUG] Starting getAllLessons...');
      console.log('📚 [DEBUG] Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
      console.log('📚 [DEBUG] Supabase Key configured:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
      
      // Test basic connection first
      const { data: testData, error: testError } = await supabase
        .from('lessons')
        .select('count')
        .limit(1);
      
      console.log('📚 [DEBUG] Connection test result:', { testData, testError });
      
      // Fetch lessons with their age groups
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select(`
          id,
          title,
          description,
          duration_minutes,
          difficulty,
          category,
          introduction_text,
          tips,
          lesson_age_groups (
            age_group
          )
        `)
        .order('title');

      console.log('📚 [DEBUG] Lessons query result:', { 
        lessonsCount: lessonsData?.length || 0, 
        error: lessonsError,
        firstLesson: lessonsData?.[0]
      });

      if (lessonsError) {
        console.error('❌ [DEBUG] Error fetching lessons:', lessonsError);
        throw new Error(`Failed to fetch lessons: ${lessonsError.message}`);
      }

      if (!lessonsData || lessonsData.length === 0) {
        console.log('⚠️ [DEBUG] No lessons found in database');
        return [];
      }

      console.log(`✅ [DEBUG] Fetched ${lessonsData.length} lessons from database`);

      // Transform the data to match our Lesson interface
      const lessons: Lesson[] = await Promise.all(lessonsData.map(async (lesson) => {
        console.log(`📚 [DEBUG] Processing lesson: ${lesson.title}`);
        
        // Fetch key points count for preview
        const { count: keyPointsCount, error: keyPointsError } = await supabase
          .from('lesson_key_points')
          .select('*', { count: 'exact', head: true })
          .eq('lesson_id', lesson.id);

        if (keyPointsError) {
          console.warn(`⚠️ [DEBUG] Error fetching key points count for ${lesson.id}:`, keyPointsError);
        }

        // Fetch scenarios count for preview
        const { count: scenariosCount, error: scenariosError } = await supabase
          .from('lesson_scenarios')
          .select('*', { count: 'exact', head: true })
          .eq('lesson_id', lesson.id);

        if (scenariosError) {
          console.warn(`⚠️ [DEBUG] Error fetching scenarios count for ${lesson.id}:`, scenariosError);
        }

        console.log(`📚 [DEBUG] Lesson ${lesson.id} counts:`, { 
          keyPointsCount: keyPointsCount || 0, 
          scenariosCount: scenariosCount || 0 
        });

        return {
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          ageGroups: lesson.lesson_age_groups.map(ag => ag.age_group as AgeGroup),
          duration: lesson.duration_minutes,
          difficulty: lesson.difficulty as 'easy' | 'medium' | 'hard',
          category: lesson.category as SafetyCategory,
          content: {
            introduction: lesson.introduction_text,
            keyPoints: [], // Will be loaded when lesson is opened
            scenarios: [], // Will be loaded when lesson is opened
            tips: lesson.tips || []
          },
          quiz: {
            questions: [] // Will be loaded when lesson is opened
          },
          // Add metadata for preview
          metadata: {
            keyPointsCount: keyPointsCount || 0,
            scenariosCount: scenariosCount || 0
          }
        };
      }));

      console.log(`✅ [DEBUG] Successfully processed ${lessons.length} lessons`);
      return lessons;
    } catch (error) {
      console.error('❌ [DEBUG] Error in getAllLessons:', error);
      throw error;
    }
  }

  // Fetch lessons filtered by age group with debug logging
  async getLessonsByAgeGroup(ageGroup: AgeGroup): Promise<Lesson[]> {
    try {
      console.log(`📚 [DEBUG] Fetching lessons for age group: ${ageGroup}`);

      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select(`
          id,
          title,
          description,
          duration_minutes,
          difficulty,
          category,
          introduction_text,
          tips,
          lesson_age_groups!inner (
            age_group
          )
        `)
        .eq('lesson_age_groups.age_group', ageGroup)
        .order('title');

      console.log(`📚 [DEBUG] Age group ${ageGroup} query result:`, { 
        lessonsCount: lessonsData?.length || 0, 
        error: lessonsError,
        firstLesson: lessonsData?.[0]
      });

      if (lessonsError) {
        console.error('❌ [DEBUG] Error fetching lessons by age group:', lessonsError);
        throw new Error(`Failed to fetch lessons for age group ${ageGroup}: ${lessonsError.message}`);
      }

      if (!lessonsData || lessonsData.length === 0) {
        console.log(`⚠️ [DEBUG] No lessons found for age group: ${ageGroup}`);
        return [];
      }

      console.log(`✅ [DEBUG] Fetched ${lessonsData.length} lessons for age group: ${ageGroup}`);

      // Transform the data and include content preview
      const lessons: Lesson[] = await Promise.all(lessonsData.map(async (lesson) => {
        // Fetch key points count for preview
        const { count: keyPointsCount } = await supabase
          .from('lesson_key_points')
          .select('*', { count: 'exact', head: true })
          .eq('lesson_id', lesson.id);

        // Fetch scenarios count for preview
        const { count: scenariosCount } = await supabase
          .from('lesson_scenarios')
          .select('*', { count: 'exact', head: true })
          .eq('lesson_id', lesson.id);

        // Fetch a preview of key points for the card
        const { data: keyPointsPreview } = await supabase
          .from('lesson_key_points')
          .select('point_text')
          .eq('lesson_id', lesson.id)
          .order('order_index')
          .limit(3);

        return {
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          ageGroups: [ageGroup], // We know it matches this age group
          duration: lesson.duration_minutes,
          difficulty: lesson.difficulty as 'easy' | 'medium' | 'hard',
          category: lesson.category as SafetyCategory,
          content: {
            introduction: lesson.introduction_text,
            keyPoints: (keyPointsPreview || []).map(kp => kp.point_text), // Preview for cards
            scenarios: [], // Will be loaded when lesson is opened
            tips: lesson.tips || []
          },
          quiz: {
            questions: [] // Will be loaded when lesson is opened
          },
          // Add metadata for display
          metadata: {
            keyPointsCount: keyPointsCount || 0,
            scenariosCount: scenariosCount || 0
          }
        };
      }));

      return lessons;
    } catch (error) {
      console.error(`❌ [DEBUG] Error in getLessonsByAgeGroup for ${ageGroup}:`, error);
      throw error;
    }
  }

  // Fetch detailed lesson content including key points, scenarios, and quiz
  async getLessonById(lessonId: string): Promise<Lesson | null> {
    try {
      console.log(`📖 [DEBUG] Fetching detailed lesson data for: ${lessonId}`);

      // Fetch basic lesson info
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select(`
          id,
          title,
          description,
          duration_minutes,
          difficulty,
          category,
          introduction_text,
          tips,
          lesson_age_groups (
            age_group
          )
        `)
        .eq('id', lessonId)
        .single();

      if (lessonError) {
        console.error('❌ [DEBUG] Error fetching lesson:', lessonError);
        throw new Error('Failed to fetch lesson');
      }

      if (!lessonData) {
        console.log(`⚠️ [DEBUG] Lesson not found: ${lessonId}`);
        return null;
      }

      // Fetch key points
      const { data: keyPointsData, error: keyPointsError } = await supabase
        .from('lesson_key_points')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('order_index');

      if (keyPointsError) {
        console.error('❌ [DEBUG] Error fetching key points:', keyPointsError);
        throw new Error('Failed to fetch lesson key points');
      }

      // Fetch scenarios
      const { data: scenariosData, error: scenariosError } = await supabase
        .from('lesson_scenarios')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('order_index');

      if (scenariosError) {
        console.error('❌ [DEBUG] Error fetching scenarios:', scenariosError);
        throw new Error('Failed to fetch lesson scenarios');
      }

      // Fetch quiz questions
      const { data: quizData, error: quizError } = await supabase
        .from('lesson_quiz_questions')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('order_index');

      if (quizError) {
        console.error('❌ [DEBUG] Error fetching quiz questions:', quizError);
        throw new Error('Failed to fetch quiz questions');
      }

      console.log(`✅ [DEBUG] Fetched complete lesson data for: ${lessonId}`);
      console.log(`📊 [DEBUG] Key points: ${keyPointsData?.length || 0}, Scenarios: ${scenariosData?.length || 0}, Quiz questions: ${quizData?.length || 0}`);

      // Ensure we have minimum required content
      const hasKeyPoints = keyPointsData && keyPointsData.length > 0;
      const hasScenarios = scenariosData && scenariosData.length > 0;
      const hasQuiz = quizData && quizData.length > 0;

      if (!hasKeyPoints) {
        console.warn(`⚠️ [DEBUG] Lesson ${lessonId} has no key points`);
      }
      if (!hasScenarios) {
        console.warn(`⚠️ [DEBUG] Lesson ${lessonId} has no practice scenarios`);
      }
      if (!hasQuiz) {
        console.warn(`⚠️ [DEBUG] Lesson ${lessonId} has no quiz questions`);
      }

      // Transform the data to match our Lesson interface
      const lesson: Lesson = {
        id: lessonData.id,
        title: lessonData.title,
        description: lessonData.description,
        ageGroups: lessonData.lesson_age_groups.map(ag => ag.age_group as AgeGroup),
        duration: lessonData.duration_minutes,
        difficulty: lessonData.difficulty as 'easy' | 'medium' | 'hard',
        category: lessonData.category as SafetyCategory,
        content: {
          introduction: lessonData.introduction_text,
          keyPoints: (keyPointsData || []).map(kp => kp.point_text),
          scenarios: (scenariosData || []).map(scenario => ({
            id: scenario.id,
            situation: scenario.situation,
            options: scenario.options,
            correctAnswer: scenario.correct_answer_index,
            explanation: scenario.explanation
          })),
          tips: lessonData.tips || []
        },
        quiz: {
          questions: (quizData || []).map(q => ({
            id: q.id,
            question: q.question_text,
            options: q.options,
            correctAnswer: q.correct_answer_index,
            explanation: q.explanation
          }))
        }
      };

      return lesson;
    } catch (error) {
      console.error(`❌ [DEBUG] Error in getLessonById for ${lessonId}:`, error);
      throw error;
    }
  }

  // Fetch all daily stories
  async getAllDailyStories(): Promise<DailyStory[]> {
    try {
      console.log('📖 [DEBUG] Fetching all daily stories from database...');

      const { data: storiesData, error: storiesError } = await supabase
        .from('daily_stories')
        .select(`
          id,
          title,
          description,
          moral_lesson,
          category,
          daily_story_age_groups (
            age_group
          )
        `)
        .order('title');

      if (storiesError) {
        console.error('❌ [DEBUG] Error fetching daily stories:', storiesError);
        throw new Error('Failed to fetch daily stories');
      }

      if (!storiesData) {
        console.log('⚠️ [DEBUG] No daily stories found in database');
        return [];
      }

      console.log(`✅ [DEBUG] Fetched ${storiesData.length} daily stories from database`);

      // Transform the data to match our DailyStory interface
      const stories: DailyStory[] = storiesData.map(story => ({
        id: story.id,
        title: story.title,
        description: story.description,
        ageGroups: story.daily_story_age_groups.map(ag => ag.age_group as AgeGroup),
        category: story.category as SafetyCategory,
        scenarios: [], // Will be loaded separately when needed
        moralLesson: story.moral_lesson
      }));

      return stories;
    } catch (error) {
      console.error('❌ [DEBUG] Error in getAllDailyStories:', error);
      throw error;
    }
  }

  // Fetch daily stories filtered by age group
  async getDailyStoriesByAgeGroup(ageGroup: AgeGroup): Promise<DailyStory[]> {
    try {
      console.log(`📖 [DEBUG] Fetching daily stories for age group: ${ageGroup}`);

      const { data: storiesData, error: storiesError } = await supabase
        .from('daily_stories')
        .select(`
          id,
          title,
          description,
          moral_lesson,
          category,
          daily_story_age_groups!inner (
            age_group
          )
        `)
        .eq('daily_story_age_groups.age_group', ageGroup)
        .order('title');

      if (storiesError) {
        console.error('❌ [DEBUG] Error fetching daily stories by age group:', storiesError);
        throw new Error('Failed to fetch daily stories');
      }

      if (!storiesData) {
        console.log(`⚠️ [DEBUG] No daily stories found for age group: ${ageGroup}`);
        return [];
      }

      console.log(`✅ [DEBUG] Fetched ${storiesData.length} daily stories for age group: ${ageGroup}`);

      // Transform the data to match our DailyStory interface
      const stories: DailyStory[] = storiesData.map(story => ({
        id: story.id,
        title: story.title,
        description: story.description,
        ageGroups: [ageGroup], // We know it matches this age group
        category: story.category as SafetyCategory,
        scenarios: [], // Will be loaded separately when needed
        moralLesson: story.moral_lesson
      }));

      return stories;
    } catch (error) {
      console.error(`❌ [DEBUG] Error in getDailyStoriesByAgeGroup for ${ageGroup}:`, error);
      throw error;
    }
  }

  // Fetch detailed daily story with scenarios
  async getDailyStoryById(storyId: string): Promise<DailyStory | null> {
    try {
      console.log(`📖 [DEBUG] Fetching detailed daily story data for: ${storyId}`);

      // Fetch basic story info
      const { data: storyData, error: storyError } = await supabase
        .from('daily_stories')
        .select(`
          id,
          title,
          description,
          moral_lesson,
          category,
          daily_story_age_groups (
            age_group
          )
        `)
        .eq('id', storyId)
        .single();

      if (storyError) {
        console.error('❌ [DEBUG] Error fetching daily story:', storyError);
        throw new Error('Failed to fetch daily story');
      }

      if (!storyData) {
        console.log(`⚠️ [DEBUG] Daily story not found: ${storyId}`);
        return null;
      }

      // Fetch scenarios
      const { data: scenariosData, error: scenariosError } = await supabase
        .from('daily_story_scenarios')
        .select('*')
        .eq('daily_story_id', storyId)
        .order('order_index');

      if (scenariosError) {
        console.error('❌ [DEBUG] Error fetching story scenarios:', scenariosError);
        throw new Error('Failed to fetch story scenarios');
      }

      console.log(`✅ [DEBUG] Fetched complete daily story data for: ${storyId}`);
      console.log(`📊 [DEBUG] Scenarios: ${scenariosData?.length || 0}`);

      // Transform the data to match our DailyStory interface
      const story: DailyStory = {
        id: storyData.id,
        title: storyData.title,
        description: storyData.description,
        ageGroups: storyData.daily_story_age_groups.map(ag => ag.age_group as AgeGroup),
        category: storyData.category as SafetyCategory,
        scenarios: (scenariosData || []).map(scenario => ({
          id: scenario.id,
          dailyStoryId: scenario.daily_story_id,
          situation: scenario.situation,
          options: scenario.options,
          correctAnswer: scenario.correct_answer_index,
          explanation: scenario.explanation,
          encouragement: scenario.encouragement,
          orderIndex: scenario.order_index
        })),
        moralLesson: storyData.moral_lesson
      };

      return story;
    } catch (error) {
      console.error(`❌ [DEBUG] Error in getDailyStoryById for ${storyId}:`, error);
      throw error;
    }
  }

  // Get lesson statistics by age group
  async getLessonStatsByAgeGroup(): Promise<{ [key in AgeGroup]: number }> {
    try {
      console.log('📊 [DEBUG] Fetching lesson statistics by age group...');

      const { data: statsData, error: statsError } = await supabase
        .from('lesson_age_groups')
        .select('age_group')
        .order('age_group');

      if (statsError) {
        console.error('❌ [DEBUG] Error fetching lesson stats:', statsError);
        throw new Error('Failed to fetch lesson statistics');
      }

      // Count lessons by age group
      const stats: { [key in AgeGroup]: number } = {
        '5-10': 0,
        '11-15': 0,
        '16-19': 0
      };

      if (statsData) {
        statsData.forEach(item => {
          const ageGroup = item.age_group as AgeGroup;
          if (stats[ageGroup] !== undefined) {
            stats[ageGroup]++;
          }
        });
      }

      console.log('✅ [DEBUG] Lesson statistics:', stats);
      return stats;
    } catch (error) {
      console.error('❌ [DEBUG] Error in getLessonStatsByAgeGroup:', error);
      throw error;
    }
  }

  // Validate lesson content completeness
  async validateLessonContent(lessonId: string): Promise<{
    hasKeyPoints: boolean;
    hasScenarios: boolean;
    hasQuiz: boolean;
    keyPointsCount: number;
    scenariosCount: number;
    quizCount: number;
  }> {
    try {
      console.log(`🔍 [DEBUG] Validating content for lesson: ${lessonId}`);

      // Check key points
      const { count: keyPointsCount } = await supabase
        .from('lesson_key_points')
        .select('*', { count: 'exact', head: true })
        .eq('lesson_id', lessonId);

      // Check scenarios
      const { count: scenariosCount } = await supabase
        .from('lesson_scenarios')
        .select('*', { count: 'exact', head: true })
        .eq('lesson_id', lessonId);

      // Check quiz questions
      const { count: quizCount } = await supabase
        .from('lesson_quiz_questions')
        .select('*', { count: 'exact', head: true })
        .eq('lesson_id', lessonId);

      const validation = {
        hasKeyPoints: (keyPointsCount || 0) > 0,
        hasScenarios: (scenariosCount || 0) > 0,
        hasQuiz: (quizCount || 0) > 0,
        keyPointsCount: keyPointsCount || 0,
        scenariosCount: scenariosCount || 0,
        quizCount: quizCount || 0
      };

      console.log(`✅ [DEBUG] Lesson ${lessonId} validation:`, validation);
      return validation;
    } catch (error) {
      console.error(`❌ [DEBUG] Error validating lesson ${lessonId}:`, error);
      throw error;
    }
  }
}

export const lessonService = new LessonService();