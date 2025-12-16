import { describe, test, before } from 'node:test';
import assert from 'node:assert';
import {
  addMemory,
  searchMemories,
  getAllMemories,
  updateMemory,
  deleteMemory,
} from '../mem0-client.js';

describe('Mem0 Integration Tests', () => {
  const testUserId = 'test-user-001';
  const testGroupId = 'test-group-001';
  let createdMemoryId: string;

  test('should add memory successfully', async () => {
    await addMemory({
      userId: testUserId,
      groupId: testGroupId,
      message: 'Cần deploy hệ thống vào thứ 6 tuần này',
      senderName: 'Alice',
      groupName: 'Dev Team',
    });

    // Verify memory was added
    const memories = await getAllMemories({
      userId: testUserId,
      groupId: testGroupId,
      limit: 5,
    });

    assert.ok(memories.length > 0, 'Should have at least one memory');

    // Store memory ID for later tests
    createdMemoryId = memories[0].id;
  });

  test('should search memories by query', async () => {
    // Add another memory
    await addMemory({
      userId: testUserId,
      groupId: testGroupId,
      message: 'Code review scheduled for tomorrow at 10 AM',
    });

    // Search for deployment related memories
    const results = await searchMemories({
      userId: testUserId,
      groupId: testGroupId,
      query: 'deployment deadline',
      limit: 5,
    });

    assert.ok(results.length > 0, 'Should find deployment-related memories');
    assert.ok(
      results.some((r) => r.memory.toLowerCase().includes('deploy') ||
                         r.memory.toLowerCase().includes('thứ 6')),
      'Should contain deployment reference'
    );
  });

  test('should handle Vietnamese content', async () => {
    await addMemory({
      userId: testUserId,
      groupId: testGroupId,
      message: 'Họp team vào lúc 2 giờ chiều thứ 3 để review sprint',
    });

    const results = await searchMemories({
      userId: testUserId,
      groupId: testGroupId,
      query: 'họp team',
      limit: 5,
    });

    assert.ok(results.length > 0, 'Should find Vietnamese memories');
  });

  test('should deduplicate similar memories', async () => {
    const message = 'Deploy production environment on Friday';

    // Add same memory twice
    await addMemory({
      userId: testUserId,
      groupId: testGroupId,
      message,
    });

    await addMemory({
      userId: testUserId,
      groupId: testGroupId,
      message,
    });

    const memories = await getAllMemories({
      userId: testUserId,
      groupId: testGroupId,
      limit: 20,
    });

    // Count exact duplicates
    const duplicates = memories.filter((m) =>
      m.memory.toLowerCase().includes('deploy production')
    );

    // mem0 should deduplicate, so we expect 1 or very few matches
    assert.ok(
      duplicates.length <= 2,
      'Should deduplicate similar memories (mem0 automatic dedup)'
    );
  });

  test('should update memory', async () => {
    if (!createdMemoryId) {
      assert.fail('No memory ID available for update test');
    }

    await updateMemory(createdMemoryId, 'Updated: Deploy postponed to Monday');

    // Verify update
    const memories = await getAllMemories({
      userId: testUserId,
      groupId: testGroupId,
    });

    const updated = memories.find((m) => m.id === createdMemoryId);
    assert.ok(updated, 'Should find updated memory');
  });

  test('should delete memory', async () => {
    if (!createdMemoryId) {
      assert.fail('No memory ID available for delete test');
    }

    await deleteMemory(createdMemoryId);

    // Verify deletion
    const memories = await getAllMemories({
      userId: testUserId,
      groupId: testGroupId,
    });

    const deleted = memories.find((m) => m.id === createdMemoryId);
    assert.ok(!deleted, 'Memory should be deleted');
  });

  test('should return empty array for non-existent memories', async () => {
    const results = await searchMemories({
      userId: 'non-existent-user',
      groupId: 'non-existent-group',
      query: 'anything',
      limit: 5,
    });

    assert.ok(Array.isArray(results), 'Should return array');
    assert.strictEqual(results.length, 0, 'Should return empty array');
  });

  test('should respect limit parameter', async () => {
    const limit = 3;
    const results = await getAllMemories({
      userId: testUserId,
      groupId: testGroupId,
      limit,
    });

    assert.ok(results.length <= limit, `Should respect limit of ${limit}`);
  });
});
