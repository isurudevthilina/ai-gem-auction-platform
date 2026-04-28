const repo = require('../src/modules/auctions/auctions.repository');
const { supabaseAdmin } = require('../src/config/supabase');
const service = require('../src/modules/auctions/auctions.service');

jest.mock('../src/modules/auctions/auctions.repository', () => ({
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findRaw: jest.fn(),
    findById: jest.fn(),
    findBySeller: jest.fn(),
    findAll: jest.fn(),
}));

jest.mock('../src/config/supabase', () => ({
    supabaseAdmin: {
        from: jest.fn(),
    },
}));

jest.mock('../src/modules/wallet/wallet.service', () => ({
    getBidSecurityState: jest.fn(),
    lockBidDeposit: jest.fn(),
    releaseBidDeposit: jest.fn(),
}));

const makeQuery = (result = {}) => ({
    data: result.data,
    error: result.error || null,
    select: jest.fn(function select() { return this; }),
    eq: jest.fn(function eq() { return this; }),
    in: jest.fn(function inFilter() { return this; }),
    neq: jest.fn(function neq() { return this; }),
    update: jest.fn(function update() { return this; }),
    maybeSingle: jest.fn(function maybeSingle() { return Promise.resolve({ data: result.maybeData || null, error: null }); }),
    single: jest.fn(function single() { return Promise.resolve({ data: result.singleData || result.data || null, error: result.error || null }); }),
});

describe('auction flow lifecycle', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('marks the gem as in_auction when creating an auction', async () => {
        const gemQuery = makeQuery({ singleData: { id: 'gem-1', seller_id: 'seller-1', status: 'listed' } });
        const duplicateQuery = makeQuery({ maybeData: null });
        const gemUpdateQuery = makeQuery();

        supabaseAdmin.from.mockImplementation((table) => {
            if (table === 'gems' && supabaseAdmin.from.mock.calls.filter(([t]) => t === 'gems').length === 1) return gemQuery;
            if (table === 'auctions') return duplicateQuery;
            if (table === 'gems') return gemUpdateQuery;
            return makeQuery();
        });
        repo.create.mockResolvedValue({ id: 'auction-1', gem_id: 'gem-1' });

        const result = await service.createAuction({
            gem_id: 'gem-1',
            starting_price: 100,
            min_bid_increment: 10,
            end_time: '2026-05-01T12:00:00.000Z',
        }, 'seller-1');

        expect(result.data.id).toBe('auction-1');
        expect(gemUpdateQuery.update).toHaveBeenCalledWith({ status: 'in_auction' });
    });

    it('hard-deletes a no-bid auction and returns the gem to listed', async () => {
        const gemUpdateQuery = makeQuery();
        repo.findRaw.mockResolvedValue({
            id: 'auction-1',
            seller_id: 'seller-1',
            status: 'active',
            bid_count: 0,
            gem_id: 'gem-1',
        });
        repo.remove.mockResolvedValue(undefined);
        supabaseAdmin.from.mockImplementation((table) => {
            if (table === 'gems') return gemUpdateQuery;
            return makeQuery();
        });

        const result = await service.cancelAuction('auction-1', { id: 'seller-1', role: 'seller' });

        expect(repo.remove).toHaveBeenCalledWith('auction-1');
        expect(gemUpdateQuery.update).toHaveBeenCalledWith({ status: 'listed' });
        expect(result).toEqual({ success: true, hard_deleted: true });
    });

    it('hard-deletes a no-bid cancelled auction and returns the gem to listed', async () => {
        const gemUpdateQuery = makeQuery();
        repo.findRaw.mockResolvedValue({
            id: 'auction-1',
            seller_id: 'seller-1',
            status: 'cancelled',
            bid_count: 0,
            gem_id: 'gem-1',
        });
        repo.remove.mockResolvedValue(undefined);
        supabaseAdmin.from.mockImplementation((table) => {
            if (table === 'gems') return gemUpdateQuery;
            return makeQuery();
        });

        const result = await service.cancelAuction('auction-1', { id: 'seller-1', role: 'seller' });

        expect(repo.remove).toHaveBeenCalledWith('auction-1');
        expect(gemUpdateQuery.update).toHaveBeenCalledWith({ status: 'listed' });
        expect(result).toEqual({ success: true, hard_deleted: true });
    });

    it('does not let sellers cancel auctions that already have bids', async () => {
        repo.findRaw.mockResolvedValue({
            id: 'auction-1',
            seller_id: 'seller-1',
            status: 'active',
            bid_count: 2,
            gem_id: 'gem-1',
        });

        const result = await service.cancelAuction('auction-1', { id: 'seller-1', role: 'seller' });

        expect(result).toEqual({ error: 'has_bids' });
        expect(repo.remove).not.toHaveBeenCalled();
    });

    it('admin cancellation with bids cancels and returns the gem to listed', async () => {
        const auctionUpdateQuery = makeQuery();
        const gemUpdateQuery = makeQuery();
        repo.findRaw.mockResolvedValue({
            id: 'auction-1',
            seller_id: 'seller-1',
            status: 'active',
            bid_count: 2,
            gem_id: 'gem-1',
        });
        supabaseAdmin.from.mockImplementation((table) => {
            if (table === 'auctions') return auctionUpdateQuery;
            if (table === 'gems') return gemUpdateQuery;
            return makeQuery();
        });

        const result = await service.cancelAuction('auction-1', { id: 'admin-1', role: 'admin' });

        expect(auctionUpdateQuery.update).toHaveBeenCalledWith({ status: 'cancelled' });
        expect(gemUpdateQuery.update).toHaveBeenCalledWith({ status: 'listed' });
        expect(result).toEqual({ success: true, hard_deleted: false });
    });
});

describe('auction repository filtering', () => {
    beforeEach(() => {
        jest.resetModules();
    });

    it('applies search/category/price filters before pagination', async () => {
        const calls = [];
        const auctionQuery = {
            select: jest.fn(function select() { calls.push('select'); return this; }),
            range: jest.fn(function range() { calls.push('range'); return this; }),
            order: jest.fn(function order() { calls.push('order'); return this; }),
            eq: jest.fn(function eq(column, value) { calls.push(`eq:${column}:${value}`); return this; }),
            in: jest.fn(function inFilter(column, value) { calls.push(`in:${column}:${value.join('|')}`); return this; }),
            gte: jest.fn(function gte(column, value) { calls.push(`gte:${column}:${value}`); return this; }),
            lte: jest.fn(function lte(column, value) { calls.push(`lte:${column}:${value}`); return this; }),
            gt: jest.fn(function gt(column, value) { calls.push(`gt:${column}`); return this; }),
            lt: jest.fn(function lt(column, value) { calls.push(`lt:${column}`); return this; }),
            or: jest.fn(function orFilter(value) { calls.push(`or:${value}`); return this; }),
            then: (resolve) => resolve({ data: [], count: 0, error: null }),
        };
        const gemQuery = {
            select: jest.fn(function select() { return this; }),
            eq: jest.fn(function eq() { return this; }),
            ilike: jest.fn(function ilike() { return this; }),
            or: jest.fn(function orFilter() { return this; }),
            then: (resolve) => resolve({ data: [{ id: 'gem-1' }, { id: 'gem-2' }], error: null }),
        };

        jest.unmock('../src/modules/auctions/auctions.repository');
        jest.doMock('../src/config/supabase', () => ({
            supabaseAdmin: {
                from: jest.fn((table) => table === 'gems' ? gemQuery : auctionQuery),
            },
        }));
        const freshRepo = require('../src/modules/auctions/auctions.repository');

        await freshRepo.findAll({
            status: 'active',
            category_id: 'cat-1',
            search: 'ruby',
            min_price: '500',
            max_price: '2000',
            page: 1,
            limit: 12,
        });

        expect(calls).toContain('in:gem_id:gem-1|gem-2');
        expect(calls.some((call) => call.startsWith('lte:start_time:'))).toBe(true);
        expect(calls).toContain('gt:end_time');
        expect(calls).toContain('gte:current_price:500');
        expect(calls).toContain('lte:current_price:2000');
        expect(calls.indexOf('range')).toBeGreaterThan(calls.indexOf('in:gem_id:gem-1|gem-2'));
        expect(calls.indexOf('range')).toBeGreaterThan(calls.indexOf('gte:current_price:500'));
        expect(calls.indexOf('range')).toBeGreaterThan(calls.indexOf('lte:current_price:2000'));
    });

    it('includes expired active auctions in completed filtering', async () => {
        const calls = [];
        const auctionQuery = {
            select: jest.fn(function select() { return this; }),
            range: jest.fn(function range() { calls.push('range'); return this; }),
            order: jest.fn(function order() { return this; }),
            eq: jest.fn(function eq(column, value) { calls.push(`eq:${column}:${value}`); return this; }),
            in: jest.fn(function inFilter(column, value) { calls.push(`in:${column}:${value.join('|')}`); return this; }),
            gte: jest.fn(function gte(column, value) { calls.push(`gte:${column}:${value}`); return this; }),
            lte: jest.fn(function lte(column, value) { calls.push(`lte:${column}:${value}`); return this; }),
            gt: jest.fn(function gt(column, value) { calls.push(`gt:${column}`); return this; }),
            lt: jest.fn(function lt(column, value) { calls.push(`lt:${column}`); return this; }),
            or: jest.fn(function orFilter(value) { calls.push(`or:${value}`); return this; }),
            then: (resolve) => resolve({ data: [], count: 0, error: null }),
        };

        jest.unmock('../src/modules/auctions/auctions.repository');
        jest.doMock('../src/config/supabase', () => ({
            supabaseAdmin: {
                from: jest.fn(() => auctionQuery),
            },
        }));
        const freshRepo = require('../src/modules/auctions/auctions.repository');

        await freshRepo.findAll({ status: 'completed', page: 1, limit: 12 });

        expect(calls.some((call) =>
            call.startsWith('or:status.in.(completed,reserve_not_met),and(status.eq.active,end_time.lte.')
        )).toBe(true);
        expect(calls).toContain('range');
    });
});
