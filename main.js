var b2Vec2 = Box2D.Common.Math.b2Vec2
,   b2_pi = Box2D.Common.b2Settings.b2_pi
,   b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef
,   b2RevoluteJoint = Box2D.Dynamics.Joints.b2RevoluteJoint
,   b2AABB = Box2D.Collision.b2AABB
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

function makeBoundBox()
{
    var bodyDef = new b2BodyDef;
    bodyDef.type = b2Body.b2_dynamicBody;
    bodyDef.position.Set(0, 0);
    var body = global.world.CreateBody(bodyDef);
    var fixDef = new b2FixtureDef;
    fixDef.density = 1;
    fixDef.friction = 0.3;
    fixDef.restitution = 0.5;

    fixDef.shape = new b2PolygonShape;

    fixDef.shape.SetAsOrientedBox(12, 0.5, new b2Vec2(0, -12), 0);
    var downBoundSprite = makeRect(0, -12, 24, 1, 0xff0000, true);
    body.CreateFixture(fixDef);

    fixDef.shape.SetAsOrientedBox(12, 0.5, new b2Vec2(12, 0), b2_pi / 2);
    var rightBoundSprite = makeRect(12, 0, 1, 24, 0xff0000, true);
    body.CreateFixture(fixDef);

    fixDef.shape.SetAsOrientedBox(12, 0.5, new b2Vec2(0, 12), 0);
    var upBoundSprite = makeRect(0, 12, 24, 1, 0xff0000, true);
    body.CreateFixture(fixDef);

    fixDef.shape.SetAsOrientedBox(12, 0.5, new b2Vec2(-12, 0), b2_pi / 2);
    body.CreateFixture(fixDef);
    var leftBoundSprite = makeRect(-12, 0, 1, 24, 0xff0000, true);

    var boundObj3D = new THREE.Object3D();
    boundObj3D.add(downBoundSprite);
    boundObj3D.add(rightBoundSprite);
    boundObj3D.add(upBoundSprite);
    boundObj3D.add(leftBoundSprite);
    global.scene.add(boundObj3D);
    global.boundObj = {obj3D: boundObj3D, body2D: body};
}

function makeGround() {
    var bodyDef = new b2BodyDef;
    bodyDef.position.Set(0, 0);
    var body = global.world.CreateBody(bodyDef);
    global.groundObj = {body2D: body};
}

function makeJoint() {
    var jointDef = new b2RevoluteJointDef;
    jointDef.bodyA = global.groundObj.body2D;
    jointDef.bodyB = global.boundObj.body2D;
    jointDef.anchorPoint = global.groundObj.body2D.GetWorldCenter();
    global.joint = global.world.CreateJoint(jointDef);
}

$(function () {
    initScene("WebGLoutput");
    initEvent();

    var gravity = new b2Vec2(0, -9.8);
    var doSleep = true;
    global.world = new b2World(gravity, doSleep);

    makeGround();
    makeBoundBox();
    makeJoint();

    var bodyDef = new b2BodyDef;
    bodyDef.type = b2Body.b2_dynamicBody;
    bodyDef.position.Set(-2, 5);
    bodyDef.angle = b2_pi / 3;
    var body = global.world.CreateBody(bodyDef);
    var fixDef = new b2FixtureDef;
    fixDef.shape = new b2PolygonShape;
    fixDef.shape.SetAsBox(0.5, 0.5);
    fixDef.density = 1;
    fixDef.friction = 0.3;
    fixDef.restitution = 0.5;
    body.CreateFixture(fixDef);
    body.ResetMassData();
    bodySprite = makeRect(-2, 5, 1, 1, 0x00ff00);

    bodyDef.position.Set(-2.1, 8);
    var circleBody = global.world.CreateBody(bodyDef);
    fixDef.shape = new b2CircleShape(0.3);
    circleBody.CreateFixture(fixDef);
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

        var pos = global.boundObj.body2D.GetPosition();
        var angle = global.boundObj.body2D.GetAngle();
        global.boundObj.obj3D.position.x = pos.x;
        global.boundObj.obj3D.position.y = pos.y;
        global.boundObj.obj3D.rotation.z = angle;
    });
});
