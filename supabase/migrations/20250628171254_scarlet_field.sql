/*
  # Populate Database with Lesson Data

  1. Insert lesson data for all age groups
  2. Insert lesson key points
  3. Insert lesson scenarios
  4. Insert quiz questions
  5. Insert daily stories and scenarios

  This migration ensures the deployed database has all the necessary lesson content.
*/

-- Clear existing data to avoid conflicts
DELETE FROM lesson_quiz_questions;
DELETE FROM lesson_scenarios;
DELETE FROM lesson_key_points;
DELETE FROM lesson_age_groups;
DELETE FROM lessons;

DELETE FROM daily_story_scenarios;
DELETE FROM daily_story_age_groups;
DELETE FROM daily_stories;

-- Insert lessons for all age groups
INSERT INTO lessons (id, title, description, duration_minutes, difficulty, category, introduction_text, tips) VALUES
-- Ages 5-10 Lessons
('safe-vs-unsafe-behavior', 'Safe vs Unsafe Behavior', 'Learn to recognize the difference between safe and unsafe situations', 10, 'easy', 'physical',
 'Learning to tell the difference between safe and unsafe helps you make good choices and stay protected.',
 ARRAY['If someone you don''t know talks to you, stay where you are and look for a trusted adult', 'Safe places have trusted adults like parents, teachers, or police officers', 'If you feel scared, it''s okay to run away and find help', 'Practice saying "I need to find my mom/dad" if a stranger approaches you']),

('stranger-danger-basics', 'Stranger Danger Basics', 'Understanding who strangers are and how to stay safe around them', 12, 'easy', 'physical',
 'Not all strangers are dangerous, but it''s important to know the safety rules when meeting new people.',
 ARRAY['Never go anywhere with someone you don''t know, even if they seem nice', 'If a stranger asks for help, tell them to ask another grown-up instead', 'Know your full name, your parents'' names, and your phone number', 'If you get lost, stay where you are and look for a police officer or store worker']),

('good-touch-bad-touch', 'Good Touch vs Bad Touch', 'Learning about appropriate and inappropriate touch', 15, 'easy', 'physical',
 'Understanding the difference between good touch and bad touch helps keep your body safe.',
 ARRAY['Your private parts are the areas covered by a bathing suit', 'No one should touch your private parts except to keep you clean or healthy', 'If someone touches you in a way that feels wrong, tell them "NO" loudly', 'Always tell a trusted adult if someone touches you inappropriately']),

('secrets-vs-surprises', 'Secrets vs Surprises', 'Understanding the difference between safe surprises and unsafe secrets', 10, 'easy', 'emotional',
 'Learning about good surprises and bad secrets helps you know when to tell a trusted adult.',
 ARRAY['Good surprises are things like birthday parties that make people happy', 'Bad secrets make you feel worried, scared, or like you might get in trouble', 'Adults should never ask you to keep secrets from your parents', 'If someone says "don''t tell anyone," that''s when you should definitely tell']),

('trusted-adults-help', 'Trusted Adults and How to Ask for Help', 'Identifying safe adults and learning when and how to ask for help', 12, 'easy', 'social',
 'Knowing who your trusted adults are and how to ask for help keeps you safe and supported.',
 ARRAY['Trusted adults are people your parents have told you are safe', 'You can always ask for help - you won''t get in trouble for asking', 'If one trusted adult can''t help, try another one', 'Practice telling trusted adults about both good and bad things that happen']),

('emergency-basics', 'Emergency Basics', 'Learning what to do in emergency situations and how to call for help', 15, 'easy', 'emergency',
 'Knowing what to do in an emergency can help keep you and others safe.',
 ARRAY['In an emergency, call 999 or 112 and speak slowly and clearly', 'Know your address or at least your street name and town', 'If there''s a fire, get out fast and meet at your family''s meeting place', 'If you''re hurt or scared, find the nearest adult and ask for help']),

('saying-no-telling', 'Saying No and Telling Someone', 'Building confidence to say no and tell trusted adults about problems', 10, 'easy', 'emotional',
 'Learning to say no and tell trusted adults helps you stay safe and feel confident.',
 ARRAY['Practice saying "NO" in a loud, strong voice when you feel uncomfortable', 'Your feelings matter - if something doesn''t feel right, speak up', 'You can say no to hugs, kisses, or any touch you don''t want', 'Telling a trusted adult about problems helps keep you and others safe']),

('body-cues-feelings', 'Recognizing Body Cues When Something Feels Wrong', 'Understanding how your body tells you when something isn''t right', 12, 'easy', 'emotional',
 'Your body has ways of telling you when something doesn''t feel safe. Learning to listen to these feelings helps keep you protected.',
 ARRAY['Pay attention to butterflies in your stomach - they might mean something''s wrong', 'If your body feels tense or scared, trust that feeling', 'When something feels "yucky" or wrong, tell a trusted adult right away', 'Your body is smart and tries to protect you by giving you warning feelings']),

-- Ages 11-15 Lessons
('types-of-bullying', 'Understanding Different Types of Bullying', 'Learn to recognize verbal, physical, and cyberbullying', 18, 'medium', 'social',
 'Bullying can happen in many different ways. Knowing how to recognize and respond to bullying helps keep you and others safe.',
 ARRAY['Document bullying by taking screenshots or writing down what happened', 'Don''t fight back physically - it can make the situation worse', 'Tell multiple trusted adults until someone takes action to help', 'Support friends who are being bullied by including them and speaking up']),

('online-safety-basics', 'Online Safety Fundamentals', 'Essential skills for staying safe while gaming, chatting, and browsing online', 20, 'medium', 'online',
 'The internet can be fun and educational, but it''s important to know how to protect yourself online.',
 ARRAY['Use privacy settings on all social media accounts and review them regularly', 'Never share passwords, even with close friends', 'Think before you post - would you be comfortable if your parents or teachers saw it?', 'Block and report anyone who makes you uncomfortable online']),

('setting-personal-boundaries', 'Setting and Respecting Personal Boundaries', 'Learning how to set your own boundaries and respect others'' boundaries', 16, 'medium', 'emotional',
 'Personal boundaries help you feel safe and respected. Learning to set and respect boundaries is important for healthy relationships.',
 ARRAY['It''s okay to say "I need time to think about it" when pressured to decide quickly', 'Practice saying "That doesn''t work for me" when setting boundaries', 'Your boundaries can be different with different people - that''s normal', 'If someone gets angry when you set boundaries, that''s a red flag about them']),

('peer-pressure-decisions', 'Handling Peer Pressure and Making Good Decisions', 'Strategies for resisting negative peer pressure and making independent choices', 18, 'medium', 'social',
 'Learning to make your own decisions helps you stay true to your values and stay safe.',
 ARRAY['Real friends will respect your decisions even if they''re different from theirs', 'Have a code word with parents to text if you need to leave a situation', 'Practice responses like "I''m not comfortable with that" before you need them', 'Remember that popular doesn''t always mean right or safe']),

('uncomfortable-secrets', 'Secrets That Feel Uncomfortable', 'Understanding when secrets are harmful and what to do about them', 15, 'medium', 'emotional',
 'Some secrets can be harmful. Learning the difference helps you know when to speak up.',
 ARRAY['Secrets about illegal activities, abuse, or danger should always be reported', 'If keeping a secret makes you feel sick or worried, it''s probably harmful', 'You''re not responsible for protecting adults by keeping their secrets', 'Talk to a counselor or trusted adult if you''re unsure about a secret']),

('recognizing-manipulation', 'Recognizing Manipulation and Unfair Treatment', 'Identifying when someone is trying to manipulate or treat you unfairly', 20, 'medium', 'emotional',
 'Learning to recognize manipulation helps you protect yourself and make better decisions about relationships.',
 ARRAY['Trust your gut if someone makes you feel confused about what really happened', 'Manipulation often starts small and gradually gets worse over time', 'Keep a journal of interactions if someone makes you question your memory', 'Healthy relationships don''t involve guilt trips or emotional blackmail']),

('building-self-esteem', 'Building Self-Esteem and Standing Up for Others', 'Developing confidence in yourself and learning to support others', 16, 'medium', 'emotional',
 'Building self-esteem helps you feel confident and empowers you to help others.',
 ARRAY['Make a list of your positive qualities and read it when you''re feeling down', 'Surround yourself with people who celebrate your successes', 'Practice self-compassion - talk to yourself like you would a good friend', 'Remember that everyone makes mistakes - they don''t define your worth']),

('healthy-friendships', 'What a Healthy Friendship Looks Like', 'Understanding the qualities of good friendships and relationships', 18, 'medium', 'social',
 'Healthy friendships are built on respect, trust, and kindness. Learning what to look for helps you build better relationships.',
 ARRAY['Healthy friends support your other friendships and don''t try to isolate you', 'Good friends respect your family time and other commitments', 'In healthy friendships, you can disagree without fear of losing the friendship', 'Pay attention to how you feel after spending time with different friends']),

-- Ages 16-19 Lessons
('healthy-vs-unhealthy-relationships', 'Recognizing Healthy vs Unhealthy Relationships', 'Understanding the signs of healthy and unhealthy relationships in friendships and romantic partnerships', 25, 'hard', 'social',
 'Healthy relationships are built on respect, trust, and communication. Learning to recognize unhealthy patterns helps you build better relationships.',
 ARRAY['Healthy partners encourage your goals and dreams, not discourage them', 'Love bombing (excessive early attention) followed by criticism is a warning sign', 'Your partner should enhance your life, not be your entire life', 'If you''re walking on eggshells around someone, the relationship isn''t healthy']),

('understanding-consent', 'Understanding Consent and Personal Autonomy', 'Learning about consent in all aspects of life and relationships', 22, 'hard', 'social',
 'Consent is about respecting yourself and others. Understanding consent helps you build healthy, respectful relationships.',
 ARRAY['Consent is ongoing - it can be withdrawn at any point during any activity', 'Being in a relationship doesn''t mean automatic consent to everything', 'Consent given under pressure, manipulation, or while impaired isn''t valid consent', 'Enthusiastic consent means both people are excited and willing participants']),

('online-privacy-exploitation', 'Online Privacy and Digital Exploitation Prevention', 'Advanced online safety including privacy settings, sexting risks, and digital exploitation', 25, 'hard', 'online',
 'As you become more independent online, it''s important to understand advanced privacy and safety concepts.',
 ARRAY['Regularly audit your social media privacy settings and friend lists', 'Be cautious about sharing location data, even with people you trust', 'Remember that anything digital can potentially be screenshot or saved', 'Use different passwords for different accounts and enable two-factor authentication']),

('emotional-abuse-control', 'Recognizing Emotional Abuse, Manipulation, and Control', 'Identifying controlling behaviors, gaslighting, and other forms of emotional abuse', 28, 'hard', 'emotional',
 'Emotional abuse can be harder to recognize than physical abuse, but it''s just as serious and harmful.',
 ARRAY['Gaslighting makes you question your own memory and perception of reality', 'Emotional abusers often isolate you from friends and family gradually', 'Keep a private journal to track patterns of behavior that concern you', 'Trust friends and family if they express concerns about your relationship']),

('power-dynamics', 'Understanding Power Dynamics in Relationships', 'Learning about how power imbalances can affect relationships and safety', 20, 'hard', 'social',
 'Understanding power dynamics helps you recognize when relationships might not be equal or safe.',
 ARRAY['Be aware of age gaps and how they might create unequal power dynamics', 'Financial dependence can create unhealthy power imbalances in relationships', 'Authority figures (teachers, bosses, coaches) have power that affects consent', 'Healthy relationships involve shared decision-making and mutual respect']),

('ending-relationships-safely', 'How to End a Relationship Safely', 'Learning strategies for ending unhealthy relationships while staying safe', 22, 'hard', 'social',
 'Sometimes relationships need to end. Knowing how to do this safely is important for your wellbeing.',
 ARRAY['Plan your exit strategy when you''re thinking clearly, not during a crisis', 'Save important documents and have a safe place to stay lined up', 'Tell trusted friends about your plans so someone knows your situation', 'Consider involving professionals like counselors or domestic violence advocates']),

('supporting-friends', 'Supporting Friends in Unsafe Situations', 'Learning how to help friends who may be in dangerous or unhealthy situations', 18, 'hard', 'social',
 'Knowing how to support friends in difficult situations can help keep them safe.',
 ARRAY['Listen without trying to fix everything - sometimes people just need support', 'Don''t promise to keep secrets about abuse or dangerous situations', 'Help them connect with professional resources rather than trying to rescue them yourself', 'Take care of your own mental health while supporting others']),

('reporting-abuse-rights', 'Reporting Abuse and Knowing Your Rights', 'Understanding how and where to report abuse and what your rights are', 25, 'hard', 'social',
 'Knowing your rights and how to report abuse empowers you to protect yourself and others.',
 ARRAY['Document abuse with photos, screenshots, and written records when safe to do so', 'Know that reporting doesn''t always mean immediate legal action - you have options', 'Contact local domestic violence hotlines for guidance specific to your situation', 'Remember that abuse is never your fault, regardless of the circumstances']),

('unhealthy-partner-behaviors', 'Recognizing Unhealthy Partner Behaviors', 'Identifying warning signs like control disguised as care, isolation, and emotional manipulation', 30, 'hard', 'emotional',
 'Learning to recognize unhealthy behaviors early can help you avoid dangerous relationships.',
 ARRAY['Excessive jealousy and possessiveness are not signs of love - they''re control tactics', 'Partners who check your phone, emails, or social media without permission are being controlling', 'Isolation from friends and family often happens gradually and may seem caring at first', 'Pay attention if you find yourself changing your behavior to avoid your partner''s anger']);

-- Insert lesson age groups
INSERT INTO lesson_age_groups (lesson_id, age_group) VALUES
-- Ages 5-10 lessons
('safe-vs-unsafe-behavior', '5-10'),
('stranger-danger-basics', '5-10'),
('good-touch-bad-touch', '5-10'),
('secrets-vs-surprises', '5-10'),
('trusted-adults-help', '5-10'),
('emergency-basics', '5-10'),
('saying-no-telling', '5-10'),
('body-cues-feelings', '5-10'),

-- Ages 11-15 lessons
('types-of-bullying', '11-15'),
('online-safety-basics', '11-15'),
('setting-personal-boundaries', '11-15'),
('peer-pressure-decisions', '11-15'),
('uncomfortable-secrets', '11-15'),
('recognizing-manipulation', '11-15'),
('building-self-esteem', '11-15'),
('healthy-friendships', '11-15'),

-- Ages 16-19 lessons
('healthy-vs-unhealthy-relationships', '16-19'),
('understanding-consent', '16-19'),
('online-privacy-exploitation', '16-19'),
('emotional-abuse-control', '16-19'),
('power-dynamics', '16-19'),
('ending-relationships-safely', '16-19'),
('supporting-friends', '16-19'),
('reporting-abuse-rights', '16-19'),
('unhealthy-partner-behaviors', '16-19');

-- Insert lesson key points
INSERT INTO lesson_key_points (lesson_id, point_text, order_index) VALUES
-- Safe vs Unsafe Behavior (Ages 5-10)
('safe-vs-unsafe-behavior', 'Safe behaviors make you feel good and protected', 0),
('safe-vs-unsafe-behavior', 'Unsafe behaviors might make you feel scared or uncomfortable', 1),
('safe-vs-unsafe-behavior', 'Always tell a trusted adult if something feels unsafe', 2),
('safe-vs-unsafe-behavior', 'Trust your feelings about what feels right', 3),

-- Stranger Danger Basics (Ages 5-10)
('stranger-danger-basics', 'A stranger is someone you don''t know well', 0),
('stranger-danger-basics', 'Never accept gifts or rides from strangers', 1),
('stranger-danger-basics', 'Stay close to trusted adults in public', 2),
('stranger-danger-basics', 'Know your full name, address, and phone number', 3),

-- Good Touch vs Bad Touch (Ages 5-10)
('good-touch-bad-touch', 'Good touches are safe, wanted, and make you feel comfortable', 0),
('good-touch-bad-touch', 'Bad touches make you feel uncomfortable, scared, or confused', 1),
('good-touch-bad-touch', 'You have the right to say no to any touch', 2),
('good-touch-bad-touch', 'Tell a trusted adult about any touch that doesn''t feel right', 3),

-- Types of Bullying (Ages 11-15)
('types-of-bullying', 'Physical bullying involves hitting, pushing, or damaging property', 0),
('types-of-bullying', 'Verbal bullying includes name-calling, threats, and mean comments', 1),
('types-of-bullying', 'Cyberbullying happens online through messages, posts, or images', 2),
('types-of-bullying', 'All forms of bullying are serious and should be reported', 3),

-- Online Safety Basics (Ages 11-15)
('online-safety-basics', 'Never share personal information like your address or phone number', 0),
('online-safety-basics', 'Use strong, unique passwords for all your accounts', 1),
('online-safety-basics', 'Be careful about what you post - it can be permanent', 2),
('online-safety-basics', 'Tell a trusted adult if someone online makes you uncomfortable', 3),

-- Understanding Consent (Ages 16-19)
('understanding-consent', 'Consent means saying yes freely without pressure', 0),
('understanding-consent', 'You can change your mind at any time', 1),
('understanding-consent', 'Consent cannot be given if someone is impaired or pressured', 2),
('understanding-consent', 'Respecting consent builds trust and healthy relationships', 3);

-- Insert lesson scenarios
INSERT INTO lesson_scenarios (lesson_id, situation, options, correct_answer_index, explanation, order_index) VALUES
('stranger-danger-basics', 'A person you don''t know offers you candy and asks you to come to their car. What should you do?',
 ARRAY['Go with them to get the candy', 'Say no and find a trusted adult immediately', 'Ask them to bring the candy to you'], 1,
 'Never go anywhere with a stranger, even if they offer treats. Always say no and find a trusted adult right away.', 0),

('good-touch-bad-touch', 'Someone touches you in a way that makes you feel uncomfortable. What should you do?',
 ARRAY['Keep it a secret', 'Say no and tell a trusted adult', 'Just ignore it'], 1,
 'You should always say no to uncomfortable touch and tell a trusted adult. Your body belongs to you.', 0),

('types-of-bullying', 'Someone at school keeps sending you mean messages online and sharing embarrassing photos of you. What should you do?',
 ARRAY['Send mean messages back', 'Block them and tell a trusted adult', 'Delete your social media accounts'], 1,
 'This is cyberbullying. Block the person and tell a trusted adult who can help you report it and stop it from continuing.', 0),

('understanding-consent', 'Your partner wants to do something physical that you''re not comfortable with. They say "if you really loved me, you would do this." What should you do?',
 ARRAY['Give in because they said they love you', 'Firmly say no and explain that love means respecting boundaries', 'Avoid talking about it'], 1,
 'This is manipulation. True love means respecting boundaries. You have the right to say no to anything that makes you uncomfortable.', 0);

-- Insert quiz questions
INSERT INTO lesson_quiz_questions (lesson_id, question_text, options, correct_answer_index, explanation, order_index) VALUES
('stranger-danger-basics', 'What should you do if a stranger asks you to help find their lost pet?',
 ARRAY['Help them look for the pet', 'Say no and walk away', 'Ask your friends to help too'], 1,
 'Adults should ask other adults for help, not children. Always say no to strangers asking for help and walk away.', 0),

('stranger-danger-basics', 'What information is safe to tell a stranger?',
 ARRAY['Your full name and address', 'Your school name and teacher', 'Nothing personal - just be polite'], 2,
 'You should never share personal information with strangers. It''s okay to be polite, but keep your personal details private.', 1),

('good-touch-bad-touch', 'What should you do if someone touches you in a way that makes you feel uncomfortable?',
 ARRAY['Keep it a secret', 'Say no and tell a trusted adult', 'Just ignore it'], 1,
 'You should always say no to uncomfortable touch and tell a trusted adult. Your body belongs to you.', 0),

('types-of-bullying', 'What is the best way to help someone who is being bullied?',
 ARRAY['Join in with the bullying', 'Tell a trusted adult and offer support to the person being bullied', 'Ignore it'], 1,
 'The best way to help is to tell a trusted adult and show support for the person being bullied. Bystanders can make a big difference.', 0),

('understanding-consent', 'Which of these is true about consent?',
 ARRAY['Once you say yes, you can''t change your mind', 'Consent can be withdrawn at any time', 'Consent isn''t needed in relationships'], 1,
 'Consent can always be withdrawn at any time. You have the right to change your mind about anything.', 0);

-- Insert daily stories
INSERT INTO daily_stories (id, title, description, moral_lesson, category) VALUES
('maya-playground-stranger', 'Maya and the Playground Stranger', 'Maya learns about stranger safety when someone she doesn''t know approaches her at the playground',
 'Always stay close to trusted adults and never go anywhere with strangers, even if they seem nice or offer treats.', 'physical'),

('sam-uncomfortable-secret', 'Sam''s Uncomfortable Secret', 'Sam learns about the difference between good surprises and bad secrets',
 'Secrets that make you feel bad or scared should always be shared with trusted adults. You won''t get in trouble for telling the truth.', 'emotional'),

('alex-cyberbullying-chat', 'Alex and the Mean Messages', 'Alex learns how to handle cyberbullying when classmates start sending mean messages online',
 'Cyberbullying is never okay. Block bullies, save evidence, and tell trusted adults who can help stop it.', 'social'),

('sam-relationship-boundaries', 'Sam''s Relationship Lesson', 'Sam learns about setting boundaries and recognizing manipulation in a dating relationship',
 'Healthy relationships are built on respect and consent. Anyone who pressures you or threatens to leave doesn''t truly care about you.', 'social');

-- Insert daily story age groups
INSERT INTO daily_story_age_groups (daily_story_id, age_group) VALUES
('maya-playground-stranger', '5-10'),
('sam-uncomfortable-secret', '5-10'),
('alex-cyberbullying-chat', '11-15'),
('sam-relationship-boundaries', '16-19');

-- Insert daily story scenarios
INSERT INTO daily_story_scenarios (daily_story_id, situation, options, correct_answer_index, explanation, encouragement, order_index) VALUES
('maya-playground-stranger', 'Maya is playing at the playground when a person she doesn''t know says, "Hi! I''m here to help kids. Want me to push you on the swing?" What should Maya do?',
 ARRAY['Say yes because they seem nice', 'Say "No thank you" and go find her mom', 'Ask them to play a different game'], 1,
 'Maya did the right thing! Even when strangers seem nice, it''s always best to say no and find a trusted adult.',
 'Great choice! You know how to stay safe with strangers.', 0),

('alex-cyberbullying-chat', 'Alex receives mean messages from classmates in a group chat. They''re sharing embarrassing photos and making fun of another student. What should Alex do?',
 ARRAY['Join in so they don''t target Alex next', 'Leave the group chat and tell a trusted adult', 'Just ignore the messages'], 1,
 'Alex should leave the group chat and tell a trusted adult. This is cyberbullying, and it''s important to get help rather than participate.',
 'Excellent choice! Standing up against bullying shows real courage.', 0),

('sam-relationship-boundaries', 'Sam''s partner keeps pressuring them to do things they''re not comfortable with, saying "if you really cared about me, you would do this." How should Sam respond?',
 ARRAY['Give in to prove they care', 'Firmly restate their boundaries and explain that love means respect', 'Avoid the topic'], 1,
 'Sam should firmly restate their boundaries. Real love and care means respecting someone''s limits, not pressuring them.',
 'Excellent! You understand that healthy relationships are built on respect and consent.', 0);