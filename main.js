$(function () {
    initScene("WebGLoutput");
    initEvent();

/*
         var   b2Vec2 = Box2D.Common.Math.b2Vec2
            ,  b2AABB = Box2D.Collision.b2AABB
         	,	b2BodyDef = Box2D.Dynamics.b2BodyDef
         	,	b2Body = Box2D.Dynamics.b2Body
         	,	b2FixtureDef = Box2D.Dynamics.b2FixtureDef
         	,	b2Fixture = Box2D.Dynamics.b2Fixture
         	,	b2World = Box2D.Dynamics.b2World
         	,	b2MassData = Box2D.Collision.Shapes.b2MassData
         	,	b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
         	,	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
         	,	b2DebugDraw = Box2D.Dynamics.b2DebugDraw
            ,  b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef
            ;
            */
    makeCircle(0, 0, 1, 0xff0000);
    makeRect(5, 5, 1, 1, 0x00ff00);
    /*
    var environment = new b2AABB();
    environment.lowerBound = new b2Vec2(-global.width / 2, -global.height / 2);
    environment.upperBound = new b2Vec2(global.width / 2, global.height / 2);
    */
    /*
    var gravity = new b2Vec2(0, -9.8);
    var doSleep = true;
    global.world = new b2World(gravity, doSleep);

    var fixDef = new b2FixtureDef;
    fixDef.density = 1.0;
    fixDef.friction = 0.5;
    fixDef.restitution = 0.2;

    var bodyDef = new b2BodyDef();
    bodyDef.type = b2Body.b2_staticBody;
    fixDef.shape = new b2PolygonShape;
    fixDef.shape.SetAsBox(10, 1);
    bodyDef.position.Set(0, -1);
    global.ground = {};
    global.ground.b2Body = global.world.CreateBody(bodyDef);
    global.ground.b2Body.CreateFixture(fixDef);
    global.ground.shape = makeRect(0, -1, 20, 2, 0x00ff00);

    bodyDef.type = b2Body.b2_dynamicBody;
    fixDef.shape = new b2PolygonShape;
    fixDef.shape.SetAsBox(1, 1);
    bodyDef.position.x = 0;
    bodyDef.position.y = 10;
    global.obj = {};
    global.obj.b2Body = global.world.CreateBody(bodyDef);
    global.obj.b2Body.CreateFixture(fixDef);
    global.obj.shape = makeRect(0, 2, 1, 1, 0x00ff00);
    console.log(global.obj.b2Body.GetPosition());
    console.log(global.obj.b2Body.GetAngle());

    UpdateHandles.addHandle(function () {

    });
    */
});
