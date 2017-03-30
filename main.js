$(function () {
    initScene("WebGLoutput");
    initEvent();

     var   b2Vec2 = Box2D.Common.Math.b2Vec2
        ,   b2_pi = Box2D.Common.Math.b2_pi
        ,  b2AABB = Box2D.Collision.b2AABB
        ,	b2BodyDef = Box2D.Dynamics.b2BodyDef
        ,	b2Body = Box2D.Dynamics.b2Body
        ,	b2FixtureDef = Box2D.Dynamics.b2FixtureDef
        ,	b2Fixture = Box2D.Dynamics.b2Fixture
        ,	b2World = Box2D.Dynamics.b2World
        ,	b2MassData = Box2D.Collision.Shapes.b2MassData
        ,	b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
        ,	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
        ,	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
        ,	b2DebugDraw = Box2D.Dynamics.b2DebugDraw
        ,  b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef
        ;
    var gravity = new b2Vec2(0, -9.8);
    var doSleep = true;
    global.world = new b2World(gravity, doSleep);
    console.log(global.world);

    var groundBodyDef = new b2BodyDef;
    groundBodyDef.position.Set(0, -0.25);
    var groundBody = global.world.CreateBody(groundBodyDef);
    var groundBox = new b2PolygonShape;
    groundBox.SetAsBox(5, 0.5);
    var groundFixtureDef = new b2FixtureDef;
    groundFixtureDef.shape = groundBox;
    groundBody.CreateFixture(groundFixtureDef, 0.0);
    groundSprite = makeRect(0, -0.25, 10, 1, 0xff0000);

    var bodyDef = new b2BodyDef;
    bodyDef.type = b2Body.b2_dynamicBody;
    bodyDef.position.Set(-2, 5);
    bodyDef.angle = 3.14 / 3;
    var body = global.world.CreateBody(bodyDef);
    var dynamicBox = new b2PolygonShape;
    dynamicBox.SetAsBox(0.5, 0.5);
    var fixtureDef = new b2FixtureDef;
    fixtureDef.shape = dynamicBox;
    fixtureDef.density = 1;
    fixtureDef.friction = 0.3;
    fixtureDef.restitution = 0.5;
    body.CreateFixture(fixtureDef);
    bodySprite = makeRect(-2, 5, 1, 1, 0x00ff00);

    bodyDef.position.Set(-2.1, 8);
    var circleBody = global.world.CreateBody(bodyDef);
    fixtureDef.shape = new b2CircleShape(0.3);
    circleBody.CreateFixture(fixtureDef);
    circleSprite = makeCircle(-2.1, 7, 0.3, 0x00ff00);

    UpdateHandles.addHandle(function () {
        if (UpdateHandles.deltaTime <= 0) {
            return;
        }
        global.world.Step(1/60, 6, 2);
        var pos = body.GetPosition();
        var angle = body.GetAngle();
        bodySprite.position.x = pos.x;
        bodySprite.position.y = pos.y;
        bodySprite.rotation.z = angle;

        var pos = circleBody.GetPosition();
        var angle = circleBody.GetAngle();
        circleSprite.position.x = pos.x;
        circleSprite.position.y = pos.y;
        circleSprite.rotation.z = angle;
    });
});
